import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET student's notes for a video
 */
router.get("/videos/:videoId/notes", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { videoId } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        content,
        video_timestamp,
        created_at,
        updated_at
      FROM video_notes
      WHERE student_id = $1
        AND video_id = $2
      ORDER BY
        COALESCE(video_timestamp, 999999),
        created_at
      `,
      [studentId, videoId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



/**
 * Create a new note for a video
 */
router.post("/videos/:videoId/notes", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { videoId } = req.params;
    const { content, video_timestamp } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Note content is required" });
    }

    if (video_timestamp != null && video_timestamp < 0) {
      return res.status(400).json({ error: "Invalid video timestamp" });
    }

    const result = await db.query(
      `
      INSERT INTO video_notes
        (student_id, video_id, content, video_timestamp)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        content,
        video_timestamp,
        created_at
      `,
      [studentId, videoId, content, video_timestamp ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



/**
 * Update a note
  */
router.put("/notes/:noteId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { noteId } = req.params;
    const { content, video_timestamp } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Note content is required" });
    }

    if (video_timestamp != null && video_timestamp < 0) {
      return res.status(400).json({ error: "Invalid video timestamp" });
    }

    const result = await db.query(
      `
      UPDATE video_notes
      SET
        content = $1,
        video_timestamp = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
        AND student_id = $4
      RETURNING
        id,
        content,
        video_timestamp,
        updated_at
      `,
      [content, video_timestamp ?? null, noteId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Delete note
 */
router.delete("/notes/:noteId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { noteId } = req.params;

    const result = await db.query(
      `
      DELETE FROM video_notes
      WHERE id = $1
        AND student_id = $2
      `,
      [noteId, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
