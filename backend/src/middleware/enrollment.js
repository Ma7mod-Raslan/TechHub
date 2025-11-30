// backend/src/middleware/enrollment.js
import db from "../db.js";

/**
 * checkEnrollment: checks whether req.user (student) is enrolled in courseId
 * - attaches req.enrollment = true/false
 * - does NOT block request (so caller can choose to block or allow)
 */
export async function checkEnrollment(req, res, next) {
  try {
    const courseId = req.params.id;
    // if no auth, simply mark not enrolled and continue
    if (!req.user) {
      req.enrollment = false;
      return next();
    }

    // if user is instructor, they "own" course only if instructor_id matches — we'll not set enrollment
    // but still continue (check ownership elsewhere)
    if (req.user.role === "instructor") {
      req.enrollment = false;
      return next();
    }

    // check enrollments table
    const r = await db.query(
      "SELECT id FROM enrollments WHERE student_id=$1 AND course_id=$2",
      [req.user.id, courseId]
    );

    req.enrollment = r.rows.length > 0;
    return next();
  } catch (err) {
    console.error("checkEnrollment error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
