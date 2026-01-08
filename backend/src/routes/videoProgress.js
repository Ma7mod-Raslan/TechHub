import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();

/**
 * ============================================================
 * POST /videos/:videoId/progress
 * ------------------------------------------------------------
 * Purpose:
 *  - Track how much time a student has watched for a video
 *  - Update watched_duration safely
 *  - Mark video as completed when >= 90% is watched
 *
 * Used by:
 *  - Frontend (YouTube player) every 5–10 seconds
 *
 * Auth:
 *  - Student must be authenticated
 * ============================================================
 */
router.post(
  "/videos/:videoId/progress",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const videoId = req.params.videoId;
      const { current_time } = req.body;

      if (current_time === undefined) {
        return res.status(400).json({ error: "current_time is required" });
      }

      /**
       * 1️⃣ Get video duration + course_id
       */
      const videoRes = await db.query(
        `
        SELECT id, duration, course_id
        FROM course_videos
        WHERE id=$1
        `,
        [videoId]
      );

      if (videoRes.rows.length === 0) {
        return res.status(404).json({ error: "Video not found" });
      }

      const { duration: videoDuration, course_id } = videoRes.rows[0];
      const safeTime = Math.min(current_time, videoDuration);

      /**
       * 2️⃣ Get existing video progress
       */
      const progressRes = await db.query(
        `
        SELECT watched_duration
        FROM student_video_progress
        WHERE student_id=$1 AND video_id=$2
        `,
        [studentId, videoId]
      );

      let watchedDuration = safeTime;

      /**
       * 3️⃣ Insert / update video progress
       */
      if (progressRes.rows.length === 0) {
        await db.query(
          `
          INSERT INTO student_video_progress
            (student_id, video_id, watched_duration)
          VALUES ($1, $2, $3)
          `,
          [studentId, videoId, watchedDuration]
        );
      } else {
        const prev = progressRes.rows[0].watched_duration;
        if (safeTime > prev) {
          watchedDuration = safeTime;
          await db.query(
            `
            UPDATE student_video_progress
            SET watched_duration=$1
            WHERE student_id=$2 AND video_id=$3
            `,
            [watchedDuration, studentId, videoId]
          );
        } else {
          watchedDuration = prev;
        }
      }

      /**
       * 4️⃣ Mark video as completed (>= 90%)
       */
      const isCompleted = watchedDuration / videoDuration >= 0.9;

      if (isCompleted) {
        await db.query(
          `
          UPDATE student_video_progress
          SET is_completed=true, completed_at=NOW()
          WHERE student_id=$1 AND video_id=$2
          `,
          [studentId, videoId]
        );
      }

      /**
       * 5️⃣ Calculate COURSE progress
       */
      const totalVideosRes = await db.query(
        `
        SELECT COUNT(*) 
        FROM course_videos
        WHERE course_id=$1
        `,
        [course_id]
      );

      const completedVideosRes = await db.query(
        `
        SELECT COUNT(*) 
        FROM student_video_progress svp
        JOIN course_videos cv ON cv.id = svp.video_id
        WHERE svp.student_id=$1
          AND svp.is_completed=true
          AND cv.course_id=$2
        `,
        [studentId, course_id]
      );

      const totalVideos = Number(totalVideosRes.rows[0].count);
      const completedVideos = Number(completedVideosRes.rows[0].count);

      const courseProgress =
        totalVideos === 0
          ? 0
          : Math.round((completedVideos / totalVideos) * 100);

      const courseCompleted = courseProgress === 100;

      /**
       * 6️⃣ Update enrollments table
       */
      await db.query(
        `
        UPDATE enrollments
        SET
          progress = $1,
          completed = $2
        WHERE student_id = $3
          AND course_id = $4
        `,
        [courseProgress, courseCompleted, studentId, course_id]
      );

      /**
       * 7️⃣ Response
       */
      res.json({
        video: {
          watched_duration: watchedDuration,
          duration: videoDuration,
          completed: isCompleted
        },
        course: {
          progress: courseProgress,
          completed: courseCompleted
        }
      });

    } catch (err) {
      console.error("Video progress error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * ============================================================
 * GET /courses/:courseId/progress
 * ------------------------------------------------------------
 * Purpose:
 *  - Calculate overall course progress percentage for a student
 *
 * Progress logic:
 *  - progress = completed_videos / total_videos * 100
 *
 * Notes:
 *  - Progress is calculated LIVE
 *  - No percentage is stored in DB
 *
 * Auth:
 *  - Student must be authenticated
 * ============================================================
 */
router.get(
  "/courses/:courseId/progress",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const courseId = req.params.courseId;

      /**
       * 1️⃣ Get total number of videos in the course
       */
      const totalRes = await db.query(
        "SELECT COUNT(*) FROM course_videos WHERE course_id=$1",
        [courseId]
      );

      /**
       * 2️⃣ Get number of completed videos for this student in this course
       */
      const completedRes = await db.query(
        `
        SELECT COUNT(*)
        FROM student_video_progress svp
        JOIN course_videos cv ON cv.id = svp.video_id
        WHERE svp.student_id=$1
          AND svp.is_completed=true
          AND cv.course_id=$2
        `,
        [studentId, courseId]
      );

      const total = Number(totalRes.rows[0].count);
      const completed = Number(completedRes.rows[0].count);

      /**
       * 3️⃣ Calculate progress percentage
       */
      const progress =
        total === 0 ? 0 : Math.round((completed / total) * 100);

      /**
       * 4️⃣ Response
       */
      res.json({
        total_videos: total,
        completed_videos: completed,
        progress_percentage: progress
      });

    } catch (err) {
      console.error("Course progress error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
