import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { checkEnrollment } from "../middleware/enrollment.js";
import { upload } from "../middleware/upload.js";
import { uploadProfileImage } from "../services/cloudinary.js";
import {
  extractVideoId,
  getYoutubeVideoDuration
} from "../utils/youtube.js";


const router = express.Router();

/* ---------------------------------------
   PUBLIC: Get all published courses (for students)
--------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.thumbnail,
        c.created_at,
        u.full_name AS instructor_name
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      WHERE c.status = 'Published'
      ORDER BY c.created_at DESC
      `
    );

    res.json({
      count: result.rows.length,
      courses: result.rows,
    });

  } catch (err) {
    console.error("Get published courses error:", err);
    res.status(500).json({ error: err.message });
  }
});



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
   INSTRUCTOR: Create course (with thumbnail)
--------------------------------------- */
router.post(
  "/create",
  authMiddleware,
  allowRoles("instructor"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, description, category, level } = req.body;

      if (!title || !description || !category || !level) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Course thumbnail is required",
        });
      }

      const instructorId = req.user.id;

      // prevent duplicate title
      const dup = await db.query(
        "SELECT id FROM courses WHERE instructor_id=$1 AND title=$2",
        [instructorId, title]
      );

      if (dup.rows.length > 0) {
        return res.status(409).json({
          error: "You already created a course with this title",
        });
      }

      // Upload thumbnail to Cloudinary
      const thumbnailUrl = await uploadProfileImage(req.file.buffer);

      // Create course
      const result = await db.query(
        `INSERT INTO courses
         (title, description, category, instructor_id, level, status, thumbnail)
         VALUES ($1, $2, $3, $4, $5, 'Draft', $6)
         RETURNING *`,
        [title, description, category, instructorId, level, thumbnailUrl]
      );

      res.status(201).json({
        message: "Course created successfully",
        course: result.rows[0],
      });

    } catch (err) {
      console.error("Create course error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


/* ---------------------------------------
   INSTRUCTOR: Add course outcomes
--------------------------------------- */
router.post(
  "/:id/outcomes",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Outcomes are required" });
      }

      // Check ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Remove old outcomes
      await db.query(
        "DELETE FROM course_outcomes WHERE course_id=$1",
        [courseId]
      );

      // Insert new outcomes
      for (const item of items) {
        await db.query(
          "INSERT INTO course_outcomes (course_id, description) VALUES ($1, $2)",
          [courseId, item]
        );
      }

      res.json({ message: "Course outcomes saved successfully" });

    } catch (err) {
      console.error("Add outcomes error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* ---------------------------------------
   INSTRUCTOR: Add course requirements
--------------------------------------- */
router.post(
  "/:id/requirements",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Requirements are required" });
      }

      // Check ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Remove old requirements
      await db.query(
        "DELETE FROM course_requirements WHERE course_id=$1",
        [courseId]
      );

      // Insert new requirements
      for (const item of items) {
        await db.query(
          "INSERT INTO course_requirements (course_id, description) VALUES ($1, $2)",
          [courseId, item]
        );
      }

      res.json({ message: "Course requirements saved successfully" });

    } catch (err) {
      console.error("Add requirements error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


/* ---------------------------------------
   INSTRUCTOR: Upload course thumbnail
--------------------------------------- */
router.put(
  "/:id/thumbnail",
  authMiddleware,
  allowRoles("instructor"),
  upload.single("file"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "Thumbnail image is required" });
      }

      // Check course ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.rows[0].instructor_id !== instructorId) {
        return res.status(403).json({ error: "Not allowed" });
      }

      // Upload to Cloudinary
      const imageUrl = await uploadProfileImage(req.file.buffer);

      // Update course thumbnail
      await db.query(
        "UPDATE courses SET thumbnail=$1 WHERE id=$2",
        [imageUrl, courseId]
      );

      res.json({
        message: "Course thumbnail updated",
        thumbnail: imageUrl,
      });

    } catch (err) {
      console.error("Upload course thumbnail error:", err);
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
          c.id,
          c.title,
          c.description,
          c.category,
          c.level,
          c.status,
          c.thumbnail,
          c.created_at,
          COUNT(DISTINCT v.id) AS videos_count,
          COUNT(DISTINCT e.id) AS enrollments_count
        FROM courses c
        LEFT JOIN course_videos v ON v.course_id = c.id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE c.instructor_id = $1
      `;

      const values = [instructorId];

      // Optional filter by status
      if (status) {
        query += " AND c.status = $2";
        values.push(status);
      }

      query += `
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;

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
   PUBLIC: Course curriculum preview
--------------------------------------- */
router.get(
  "/:courseId/videos-preview",
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // Check course exists and is Published
      const courseRes = await db.query(
        "SELECT status FROM courses WHERE id=$1",
        [courseId]
      );

      if (courseRes.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (courseRes.rows[0].status !== "Published") {
        return res.status(403).json({
          error: "Course preview is not available",
        });
      }

      // Fetch preview videos (no video_url)
      const videosRes = await db.query(
        `SELECT
           id,
           title,
           duration,
           description,
           video_order
         FROM course_videos
         WHERE course_id=$1
         ORDER BY video_order ASC`,
        [courseId]
      );

      res.json(videosRes.rows);

    } catch (err) {
      console.error("Videos preview error:", err);
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
      const { title, description, category, level } = req.body;

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
         SET title=$1, description=$2, category=$3, level=$4
         WHERE id=$5
         RETURNING *`,
        [title, description, category, level, courseId]
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
   INSTRUCTOR: Update course outcomes
--------------------------------------- */
router.put(
  "/:id/outcomes",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      // Check ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Replace outcomes
      await db.query("DELETE FROM course_outcomes WHERE course_id=$1", [courseId]);

      for (const item of items) {
        await db.query(
          "INSERT INTO course_outcomes (course_id, description) VALUES ($1, $2)",
          [courseId, item]
        );
      }

      res.json({ message: "Course outcomes updated successfully" });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


/* ---------------------------------------
   INSTRUCTOR: Update course requirements
--------------------------------------- */
router.put(
  "/:id/requirements",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const instructorId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      // Check ownership
      const course = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (course.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "Not allowed" });

      // Replace requirements
      await db.query(
        "DELETE FROM course_requirements WHERE course_id=$1",
        [courseId]
      );

      for (const item of items) {
        await db.query(
          "INSERT INTO course_requirements (course_id, description) VALUES ($1, $2)",
          [courseId, item]
        );
      }

      res.json({ message: "Course requirements updated successfully" });

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
    PUBLIC: Get course details with videos, outcomes, requirements
--------------------------------------- */
router.get("/allInfo/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    /**
     * =========================
     * Get course main info
     * =========================
     */
    const courseRes = await db.query(
      `
      SELECT
        c.id,
        c.title,
        c.description,
        c.thumbnail,
        c.category,
        c.level,
        u.full_name AS instructor_name
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      WHERE c.id = $1
        AND c.status = 'published'
      `,
      [courseId]
    );

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = courseRes.rows[0];

    /**
     * =========================
     * Get course videos
     * =========================
     */
    const videosRes = await db.query(
      `
      SELECT
        id,
        title,
        description,
        duration
      FROM course_videos
      WHERE course_id = $1
      ORDER BY position ASC
      `,
      [courseId]
    );

    /**
     * =========================
     * Calculate total duration
     * =========================
     */
    const durationRes = await db.query(
      `
      SELECT COALESCE(SUM(duration), 0) AS total_duration
      FROM course_videos
      WHERE course_id = $1
      `,
      [courseId]
    );

    /**
     * =========================
     * Get outcomes
     * =========================
     */
    const outcomesRes = await db.query(
      `
      SELECT outcome
      FROM course_outcomes
      WHERE course_id = $1
      ORDER BY id ASC
      `,
      [courseId]
    );

    /**
     * =========================
     * Get requirements
     * =========================
     */
    const requirementsRes = await db.query(
      `
      SELECT requirement
      FROM course_requirements
      WHERE course_id = $1
      ORDER BY id ASC
      `,
      [courseId]
    );

    res.json({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      level: course.level,
      instructor_name: course.instructor_name,
      total_duration: Number(durationRes.rows[0].total_duration),
      outcomes: outcomesRes.rows.map(o => o.outcome),
      requirements: requirementsRes.rows.map(r => r.requirement),
      videos: videosRes.rows
    });

  } catch (err) {
    console.error("Get course details error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


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

      // 1️⃣ Get course
      const courseRes = await db.query(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.status,
        c.thumbnail,
        c.instructor_id,
        c.created_at,
        u.full_name AS instructor_name
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      WHERE c.id = $1`,
      [courseId]
    );


      if (courseRes.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }

      const course = courseRes.rows[0];

      // 2️⃣ If course is Draft → only owner instructor can view
      if (course.status === "Draft") {
        if (!userId || course.instructor_id !== userId) {
          return res.status(403).json({
            error: "Course is in draft mode"
          });
        }
      }

      // 3️⃣ Get outcomes
      const outcomesRes = await db.query(
        "SELECT description FROM course_outcomes WHERE course_id=$1",
        [courseId]
      );

      // 4️⃣ Get requirements
      const reqRes = await db.query(
        "SELECT description FROM course_requirements WHERE course_id=$1",
        [courseId]
      );

      // Attach them to response
      course.outcomes = outcomesRes.rows.map(r => r.description);
      course.requirements = reqRes.rows.map(r => r.description);

      res.json(course);

    } catch (err) {
      console.error("Get course details error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
