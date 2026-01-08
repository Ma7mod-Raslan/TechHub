import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { checkEnrollment } from "../middleware/enrollment.js";
import {
  extractVideoId,
  getYoutubeVideoDuration
} from "../utils/youtube.js";


const router = express.Router();


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
      const instructorId = req.user.id;
      const { title, description, video_url, video_order } = req.body;

      // 1️⃣ Validate required fields
      if (!title || !video_url || video_order === undefined) {
        return res.status(400).json({
          error: "title, video_url and video_order are required"
        });
      }

      // 2️⃣ Check course ownership
      const owner = await db.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (owner.rows.length === 0)
        return res.status(404).json({ error: "Course not found" });

      if (owner.rows[0].instructor_id !== instructorId)
        return res.status(403).json({ error: "You do not own this course" });

      // 3️⃣ Prevent duplicate video_order
      const existsOrder = await db.query(
        `
        SELECT id
        FROM course_videos
        WHERE course_id=$1 AND video_order=$2
        `,
        [courseId, video_order]
      );

      if (existsOrder.rows.length > 0) {
        return res.status(500).json({
          error: "video_order already exists for this course"
        });
      }

      // 4️⃣ Extract YouTube video ID
      const youtubeVideoId = extractVideoId(video_url);
      if (!youtubeVideoId) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      // 5️⃣ Get video duration from YouTube
      const duration = await getYoutubeVideoDuration(youtubeVideoId);

      // 6️⃣ Insert new video with duration
      const result = await db.query(
        `
        INSERT INTO course_videos
        (course_id, title, description, video_url, video_order, duration)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [courseId, title, description, video_url, video_order, duration]
      );

      res.status(201).json({
        message: "Video added successfully",
        video: result.rows[0]
      });

    } catch (err) {
      console.error("Add video error:", err);
      res.status(500).json({
        error: err.message
      });
    }
  }
);


/* ---------------------------------------
   INSTRUCTOR: Update video
--------------------------------------- */
router.put(
  "/:courseId/videos/:videoId",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    const client = await db.connect();

    try {
      const { courseId, videoId } = req.params;
      const instructorId = req.user.id;
      const { title, description, video_url, video_order } = req.body;

      await client.query("BEGIN");

      // 1️⃣ Check course ownership
      const course = await client.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.rows[0].instructor_id !== instructorId) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not allowed" });
      }

      // 2️⃣ Get current video order
      const videoRes = await client.query(
        `
        SELECT video_order
        FROM course_videos
        WHERE id=$1 AND course_id=$2
        `,
        [videoId, courseId]
      );

      if (videoRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Video not found" });
      }

      const oldOrder = videoRes.rows[0].video_order;
      const newOrder = video_order;

      // 3️⃣ Reorder other videos if order changed
      if (newOrder !== undefined && newOrder !== oldOrder) {

        if (newOrder < oldOrder) {
          // moving up
          await client.query(
            `
            UPDATE course_videos
            SET video_order = video_order + 1
            WHERE course_id = $1
              AND video_order >= $2
              AND video_order < $3
            `,
            [courseId, newOrder, oldOrder]
          );
        } else {
          // moving down
          await client.query(
            `
            UPDATE course_videos
            SET video_order = video_order - 1
            WHERE course_id = $1
              AND video_order > $2
              AND video_order <= $3
            `,
            [courseId, oldOrder, newOrder]
          );
        }
      }

      // 4️⃣ Update the target video itself
      const result = await client.query(
        `
        UPDATE course_videos
        SET title=$1,
            description=$2,
            video_url=$3,
            video_order=$4
        WHERE id=$5
        RETURNING *
        `,
        [
          title,
          description,
          video_url,
          newOrder ?? oldOrder,
          videoId
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Video updated and reordered successfully",
        video: result.rows[0]
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Update video error:", err);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
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
    const client = await db.connect();

    try {
      const { courseId, videoId } = req.params;
      const instructorId = req.user.id;

      await client.query("BEGIN");

      // 1️⃣ Check course ownership
      const course = await client.query(
        "SELECT instructor_id FROM courses WHERE id=$1",
        [courseId]
      );

      if (course.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Course not found" });
      }

      if (course.rows[0].instructor_id !== instructorId) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Not allowed" });
      }

      // 2️⃣ Get video order before deletion
      const video = await client.query(
        `
        SELECT id, video_order
        FROM course_videos
        WHERE id=$1 AND course_id=$2
        `,
        [videoId, courseId]
      );

      if (video.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Video not found" });
      }

      const deletedVideoOrder = video.rows[0].video_order;

      // 3️⃣ Delete the video
      await client.query(
        "DELETE FROM course_videos WHERE id=$1",
        [videoId]
      );

      // 4️⃣ Reorder remaining videos
      await client.query(
        `
        UPDATE course_videos
        SET video_order = video_order - 1
        WHERE course_id = $1
          AND video_order > $2
        `,
        [courseId, deletedVideoOrder]
      );

      await client.query("COMMIT");

      res.json({
        message: "Video deleted and videos reordered successfully"
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete video error:", err);
      res.status(404).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

/* ---------------------------------------
    GET course videos progress for student
--------------------------------------- */
router.get(
  "/courses/:courseId/videos-progress",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { courseId } = req.params;

      const result = await db.query(
        `
        SELECT
          cv.id AS video_id,
          cv.title,
          cv.duration,
          cv.video_order,
          COALESCE(svp.is_completed, false) AS is_completed
        FROM course_videos cv
        LEFT JOIN student_video_progress svp
          ON svp.video_id = cv.id
         AND svp.student_id = $1
        WHERE cv.course_id = $2
        ORDER BY cv.video_order ASC
        `,
        [studentId, courseId]
      );

      res.json({
        course_id: courseId,
        total_videos: result.rows.length,
        videos: result.rows
      });
    } catch (err) {
      console.error("Get videos progress error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


/* ---------- 
  GET course videos (only for enrolled students or instructor owner)
---------- */
/* GET /api/courses/:id/videos */
router.get(
  "/:id/videos",
  authMiddleware,
  checkEnrollment,
  async (req, res) => {
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
      } else {
        // Published course: videos visible only to enrolled students or instructor owner
        const isOwner = req.user && req.user.id === course.instructor_id;
        const isEnrolled = !!req.enrollment;

        if (!isOwner && !isEnrolled) {
          return res
            .status(403)
            .json({ error: "You must enroll to view videos" });
        }
      }

      // fetch videos ordered by video_order asc
      const v = await db.query(
        `
        SELECT
          id,
          course_id,
          video_order,
          title,
          video_url,
          description,
          duration,
          created_at
        FROM course_videos
        WHERE course_id=$1
        ORDER BY video_order ASC
        `,
        [courseId]
      );

      res.json(v.rows);
    } catch (err) {
      console.error("Get videos error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;