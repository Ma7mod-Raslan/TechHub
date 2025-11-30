import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { checkEnrollment } from "../middleware/enrollment.js";



const router = express.Router();

/* ---------- ENROLL a student in a course ---------- */
/* POST /api/courses/:id/enroll  (student only) */
router.post(
  "/:id/enroll",
  authMiddleware,
  allowRoles("student"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const studentId = req.user.id;

      // ensure course exists and is Published (students shouldn't enroll in Draft)
      const c = await db.query("SELECT id, status FROM courses WHERE id=$1", [courseId]);
      if (c.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (c.rows[0].status !== "Published") {
        return res.status(400).json({ error: "Cannot enroll in a draft course" });
      }

      // prevent duplicate enrollment
      const exists = await db.query(
        "SELECT id FROM enrollments WHERE student_id=$1 AND course_id=$2",
        [studentId, courseId]
      );
      if (exists.rows.length > 0) {
        return res.status(200).json({ message: "Already enrolled" });
      }

      const result = await db.query(
        `INSERT INTO enrollments (student_id, course_id, progress, completed)
         VALUES ($1, $2, 0, false) RETURNING *`,
        [studentId, courseId]
      );

      res.status(201).json({ message: "Enrolled successfully", enrollment: result.rows[0] });
    } catch (err) {
      console.error("Enroll error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------- GET course videos (only for enrolled students or instructor owner) ---------- */
/* GET /api/courses/:id/videos */
router.post(
  "/create",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const { title, description, category, level, thumbnail } = req.body;

      if (!title || !description || !category || !level || !thumbnail) {
        return res.status(400).json({
          error: "All fields including thumbnail are required",
        });
      }

      const instructorId = req.user.id;

      // prevent duplicate course with same title for same instructor
      const dup = await db.query(
        "SELECT id FROM courses WHERE instructor_id=$1 AND title=$2",
        [instructorId, title]
      );

      if (dup.rows.length > 0) {
        return res.status(409).json({
          error: "You already created a course with this title",
        });
      }

      const result = await db.query(
        `INSERT INTO courses
         (title, description, category, instructor_id, level, status, thumbnail)
         VALUES ($1, $2, $3, $4, $5, 'Draft', $6)
         RETURNING *`,
        [title, description, category, instructorId, level, thumbnail]
      );

      res.status(201).json({
        message: "Course created (Draft)",
        course: result.rows[0],
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


/* ---------------------------------------
   PUBLIC: Get all published courses
--------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, category, level, thumbnail, created_at
       FROM courses
       WHERE status='Published'
       ORDER BY created_at DESC`
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------
   INSTRUCTOR: Create course (Draft)
--------------------------------------- */
router.post(
  "/create",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    console.log("REQ.USER = ", req.user);
    try {
      const { title, description, category, level, thumbnail } = req.body;

      // required fields
      if (!title || !description || !category || !level || !thumbnail) {
        return res.status(400).json({
          error: "All fields including thumbnail are required",
        });
      }

      const instructorId = req.user.id;

      const result = await db.query(
        `INSERT INTO courses
         (title, description, category, instructor_id, level, status, thumbnail)
         VALUES ($1, $2, $3, $4, $5, 'Draft', $6)
         RETURNING *`,
        [title, description, category, instructorId, level, thumbnail]
      );

      res.status(201).json({
        message: "Course created (Draft)",
        course: result.rows[0],
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Publish course
--------------------------------------- */
router.put(
  "/:id/publish",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;

      // instructor owns this course?
      const c = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (c.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (c.rows[0].instructor_id !== req.user.id)
        return res.status(403).json({ error: "Not allowed" });

      const result = await db.query(
        "UPDATE courses SET status='Published' WHERE id=$1 RETURNING *",
        [courseId]
      );

      res.json({
        message: "Course published",
        course: result.rows[0],
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Update course
--------------------------------------- */
router.put(
  "/:id",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const { title, description, category, level, thumbnail } = req.body;

      const c = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (c.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (c.rows[0].instructor_id !== req.user.id)
        return res.status(403).json({ error: "Not allowed" });

      const result = await db.query(
        `UPDATE courses
         SET title=$1, description=$2, category=$3, level=$4, thumbnail=$5
         WHERE id=$6
         RETURNING *`,
        [title, description, category, level, thumbnail, courseId]
      );

      res.json({
        message: "Course updated",
        course: result.rows[0],
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Delete course
--------------------------------------- */
router.delete(
  "/:id",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;

      const c = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (c.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (c.rows[0].instructor_id !== req.user.id)
        return res.status(403).json({ error: "Not allowed" });

      await db.query("DELETE FROM courses WHERE id=$1", [courseId]);

      res.json({ message: "Course deleted" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Add video
--------------------------------------- */
router.post(
  "/:id/videos",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const { title, video_url, description, video_order } = req.body;

      if (!title || !video_url || !video_order)
        return res.status(400).json({ error: "Missing fields" });

      // check ownership
      const c = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (c.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (c.rows[0].instructor_id !== req.user.id)
        return res.status(403).json({ error: "Not allowed" });

      const result = await db.query(
        `INSERT INTO course_videos 
        (course_id, video_order, title, video_url, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [courseId, video_order, title, video_url, description]
      );

      res.json({ message: "Video added", video: result.rows[0] });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);



/* ---------- 
  GET course videos (only for enrolled students or instructor owner)
---------- */
/* GET /api/courses/:id/videos */
router.get("/:id/videos", authMiddleware, checkEnrollment, async (req, res) => {
  try {
    const courseId = req.params.id;

    // fetch course (to check status and owner)
    const courseRes = await db.query(
      "SELECT id, instructor_id, status FROM courses WHERE id=$1",
      [courseId]
    );
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const course = courseRes.rows[0];

    // if course is Draft: only instructor owner can view videos
    if (course.status === "Draft") {
      if (!req.user || req.user.id !== course.instructor_id) {
        return res.status(403).json({ error: "Course is in draft" });
      }
      // owner can view videos
    } else {
      // Published course: videos visible only to enrolled students or instructor owner
      const isOwner = req.user && req.user.id === course.instructor_id;
      const isEnrolled = !!req.enrollment;

      if (!isOwner && !isEnrolled) {
        return res.status(403).json({ error: "You must enroll to view videos" });
      }
    }

    // fetch videos ordered by video_order asc
    const v = await db.query(
      `SELECT id, course_id, video_order, title, video_url, description, created_at
       FROM course_videos
       WHERE course_id=$1
       ORDER BY video_order ASC`,
      [courseId]
    );

    res.json(v.rows);
  } catch (err) {
    console.error("Get videos error:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
