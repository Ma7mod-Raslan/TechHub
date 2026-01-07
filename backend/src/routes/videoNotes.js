import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET student's note for a video
 */
router.get(
  "/videos/:videoId/note",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { videoId } = req.params;

      const noteRes = await db.query(
        `
        SELECT id, content, updated_at
        FROM video_notes
        WHERE student_id=$1 AND video_id=$2
        `,
        [studentId, videoId]
      );

      if (noteRes.rows.length === 0) {
        return res.json({ note: null });
      }

      res.json(noteRes.rows[0]);

    } catch (err) {
      console.error("Get note error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Add or update note
 */
router.post(
  "/videos/:videoId/note",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { videoId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "content is required" });
      }

      const result = await db.query(
        `
        INSERT INTO video_notes (student_id, video_id, content)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id, video_id)
        DO UPDATE
        SET content = EXCLUDED.content,
            updated_at = NOW()
        RETURNING *
        `,
        [studentId, videoId, content]
      );

      res.json({
        message: "Note saved",
        note: result.rows[0]
      });

    } catch (err) {
      console.error("Save note error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Delete note
 */
router.delete(
  "/videos/:videoId/note",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { videoId } = req.params;

      await db.query(
        `
        DELETE FROM video_notes
        WHERE student_id=$1 AND video_id=$2
        `,
        [studentId, videoId]
      );

      res.json({ message: "Note deleted" });

    } catch (err) {
      console.error("Delete note error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
