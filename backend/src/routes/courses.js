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

/* ---------------------------------------
   INSTRUCTOR: Create course (Draft)
--------------------------------------- */
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
   INSTRUCTOR: Get my courses (Draft / Published)
--------------------------------------- */
router.get(
  "/instructor",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const instructorId = req.user.id;
      const { status } = req.query;

      let query = `
        SELECT 
          id,
          title,
          description,
          category,
          level,
          status,
          thumbnail,
          created_at
        FROM courses
        WHERE instructor_id = $1
      `;

      const values = [instructorId];

      // Optional filter by status
      if (status) {
        query += " AND status = $2";
        values.push(status);
      }

      query += " ORDER BY created_at DESC";

      const result = await db.query(query, values);

      res.json({
        count: result.rows.length,
        courses: result.rows,
      });

    } catch (err) {
      console.error("Get instructor courses error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   GET course details
   - Instructor owner: can see Draft & Published
   - Others: Published only
--------------------------------------- */
router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      // Get course
      const courseRes = await db.query(
        `SELECT
           id,
           title,
           description,
           category,
           level,
           status,
           thumbnail,
           instructor_id,
           created_at
         FROM courses
         WHERE id = $1`,
        [courseId]
      );

      if (courseRes.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }

      const course = courseRes.rows[0];

      // If course is Draft → only owner instructor can view
      if (course.status === "Draft") {
        if (!userId || course.instructor_id !== userId) {
          return res.status(403).json({
            error: "Course is in draft mode"
          });
        }
      }

      res.json(course);

    } catch (err) {
      console.error("Get course details error:", err);
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
router.post("/:id/videos", authMiddleware, allowRoles("instructor"), async (req, res) => {
  try {
    const courseId = req.params.id;
    const instructorId = req.user.id;
    const { title, description, video_url, video_order } = req.body;

    // Only owner instructor can add videos
    const owner = await db.query(
      "SELECT id, instructor_id FROM courses WHERE id=$1",
      [courseId]
    );

    if (owner.rows.length === 0)
      return res.status(404).json({ error: "Course not found" });

    if (owner.rows[0].instructor_id !== instructorId)
      return res.status(403).json({ error: "You do not own this course" });

    // Prevent Duplicate video_order
    const existsOrder = await db.query(
      `SELECT id FROM course_videos
       WHERE course_id=$1 AND video_order=$2`,
      [courseId, video_order]
    );

    if (existsOrder.rows.length > 0) {
      return res.status(400).json({
        error: "video_order already exists for this course"
      });
    }

    // Insert new video
    const result = await db.query(
      `INSERT INTO course_videos (course_id, title, description, video_url, video_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseId, title, description, video_url, video_order]
    );

    res.status(201).json({
      message: "Video added",
      video: result.rows[0],
    });

  } catch (err) {
    console.error("Add video error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------
   INSTRUCTOR: Update video
--------------------------------------- */
router.put(
  "/:courseId/videos/:videoId",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const { courseId, videoId } = req.params;
      const instructorId = req.user.id;
      const { title, description, video_url, video_order } = req.body;

      // Check course ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Check video exists
      const video = await db.query(
        "SELECT id FROM course_videos WHERE id=$1 AND course_id=$2",
        [videoId, courseId]
      );

      if (video.rows.length === 0)
        return res.status(404).json({ error: "Video not found" });

      // Prevent duplicate video_order
      if (video_order !== undefined) {
        const orderExists = await db.query(
          `SELECT id FROM course_videos
           WHERE course_id=$1 AND video_order=$2 AND id<>$3`,
          [courseId, video_order, videoId]
        );

        if (orderExists.rows.length > 0) {
          return res.status(400).json({
            error: "video_order already exists for this course",
          });
        }
      }

      const result = await db.query(
        `UPDATE course_videos
         SET title=$1,
             description=$2,
             video_url=$3,
             video_order=$4
         WHERE id=$5
         RETURNING *`,
        [title, description, video_url, video_order, videoId]
      );

      res.json({
        message: "Video updated",
        video: result.rows[0],
      });

    } catch (err) {
      console.error("Update video error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Delete video
--------------------------------------- */
router.delete(
  "/:courseId/videos/:videoId",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const { courseId, videoId } = req.params;
      const instructorId = req.user.id;

      // Check course ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Check video exists
      const video = await db.query(
        "SELECT id FROM course_videos WHERE id=$1 AND course_id=$2",
        [videoId, courseId]
      );

      if (video.rows.length === 0)
        return res.status(404).json({ error: "Video not found" });

      await db.query(
        "DELETE FROM course_videos WHERE id=$1",
        [videoId]
      );

      res.json({ message: "Video deleted" });

    } catch (err) {
      console.error("Delete video error:", err);
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
