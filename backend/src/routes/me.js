import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.profile_image,
        u.bio,
        u.created_at,
        ip.job_title,
        ip.linkedin,
        ip.expertise
      FROM users u
      LEFT JOIN instructor_profiles ip
        ON u.id = ip.user_id
      WHERE u.id = $1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Construct the response object
    const response = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
      bio: user.bio,
      created_at: user.created_at,
    };

    // If the user is an instructor, include instructor profile details
    if (user.role === "instructor") {
      response.instructor_profile = {
        job_title: user.job_title,
        linkedin: user.linkedin,
        expertise: user.expertise,
      };
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
