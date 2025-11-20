// backend/src/routes/me.js
import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT id, full_name, email, role, profile_image, bio, created_at FROM users WHERE id=$1", [
      req.user.userId,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
