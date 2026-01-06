const express = require("express");
const router = express.Router();
const db = require("../db"); // pg pool
const auth = require("../middleware/auth");

router.post("/video-progress", auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { video_id, current_time } = req.body;

    if (!video_id || current_time === undefined) {
      return res.status(400).json({ error: "video_id and current_time required" });
    }

    // get video duration
    const videoResult = await db.query(
      "SELECT duration FROM videos WHERE id = $1",
      [video_id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const videoDuration = videoResult.rows[0].duration;

    // get or create progress row
    const progressResult = await db.query(
      `SELECT watched_duration, is_completed
       FROM student_video_progress
       WHERE student_id=$1 AND video_id=$2`,
      [studentId, video_id]
    );

    let watchedDuration = Math.min(current_time, videoDuration);

    if (progressResult.rows.length === 0) {
      await db.query(
        `INSERT INTO student_video_progress
         (student_id, video_id, watched_duration)
         VALUES ($1, $2, $3)`,
        [studentId, video_id, watchedDuration]
      );
    } else {
      const prevDuration = progressResult.rows[0].watched_duration;

      if (watchedDuration > prevDuration) {
        await db.query(
          `UPDATE student_video_progress
           SET watched_duration = $1
           WHERE student_id=$2 AND video_id=$3`,
          [watchedDuration, studentId, video_id]
        );
      }
    }

    // check completion (>= 90%)
    if (watchedDuration / videoDuration >= 0.9) {
      await db.query(
        `UPDATE student_video_progress
         SET is_completed = true, completed_at = NOW()
         WHERE student_id=$1 AND video_id=$2`,
        [studentId, video_id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
