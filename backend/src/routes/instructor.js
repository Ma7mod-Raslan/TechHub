import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
const router = express.Router();

/**
 * GET instructor stats
 */
router.get(
  "/stats",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const instructorId = req.user.id;

      // 1️⃣ Total courses
      const coursesRes = await db.query(
        `
        SELECT COUNT(*)
        FROM courses
        WHERE instructor_id = $1
        `,
        [instructorId]
      );

      // 2️⃣ Total students (unique)
      const studentsRes = await db.query(
        `
        SELECT COUNT(DISTINCT e.user_id)
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE c.instructor_id = $1
        `,
        [instructorId]
      );

      // 3️⃣ Top courses by enrollment
      const topCoursesRes = await db.query(
        `
        SELECT
          c.id,
          c.title,
          COUNT(e.user_id) AS total_students
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE c.instructor_id = $1
        GROUP BY c.id
        ORDER BY total_students DESC
        LIMIT 5
        `,
        [instructorId]
      );

      res.json({
        total_courses: Number(coursesRes.rows[0].count),
        total_students: Number(studentsRes.rows[0].count),
        top_courses: topCoursesRes.rows
      });

    } catch (err) {
      console.error("Instructor stats error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);
export default router;