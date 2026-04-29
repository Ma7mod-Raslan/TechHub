import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadProfileImage } from "../services/cloudinary.js";

const router = express.Router();

/**
 * =========================
 * Update profile image
 * =========================
 */
router.put(
  "/profile-image",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const imageUrl = await uploadProfileImage(req.file.buffer);

      await db.query(
        "UPDATE users SET profile_image = $1 WHERE id = $2",
        [imageUrl, req.user.id]
      );

      res.json({
        message: "Profile image updated",
        profile_image: imageUrl,
      });
    } catch (err) {
      console.error("Profile image upload error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * =========================
 * Get user profile
 * =========================
 */
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
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const response = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
      bio: user.bio,
      created_at: user.created_at,
    };

    if (user.role === "instructor") {
      response.instructor_profile = {
        job_title: user.job_title,
        linkedin: user.linkedin,
        expertise: user.expertise ?? [],
      };
    }

    res.json(response);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * =========================
 * Update user profile
 * =========================
 */
router.put(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        full_name,
        profile_image,
        bio,
        job_title,
        linkedin,
        expertise
      } = req.body;

      // 1️⃣ Update users table
      await db.query(
        `
        UPDATE users
        SET
          full_name = COALESCE($1, full_name),
          profile_image = COALESCE($2, profile_image),
          bio = COALESCE($3, bio)
        WHERE id = $4
        `,
        [full_name, profile_image, bio, userId]
      );

      // 2️⃣ Check if user is instructor
      const roleRes = await db.query(
        "SELECT role FROM users WHERE id=$1",
        [userId]
      );

      if (roleRes.rows[0].role === "instructor") {
        // Upsert instructor profile
        const current = await db.query(
          "SELECT job_title, linkedin, expertise FROM instructor_profiles WHERE user_id=$1",
          [userId]
        );
        const currentProfile = current.rows[0] || {};

        await db.query(
          `
          INSERT INTO instructor_profiles (user_id, job_title, linkedin, expertise)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE SET
            job_title = $2,
            linkedin = $3,
            expertise = $4
          `,
          [
            userId,
            job_title ?? currentProfile.job_title,
            linkedin ?? currentProfile.linkedin,
            expertise ?? currentProfile.expertise
          ]
        );
      }

      res.json({
        message: "Profile updated successfully"
      });

    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


/**
 * =========================
 * Get enrolled courses with progress (OPTIMIZED)
 * =========================
 */
router.get("/my-courses", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT
        c.id,
        c.title,
        c.thumbnail,
        u.full_name AS instructor_name,
        COUNT(cv.id) AS total_videos,
        COUNT(
          CASE 
            WHEN svp.is_completed = true THEN 1 
          END
        ) AS completed_videos
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN course_videos cv ON cv.course_id = c.id
      LEFT JOIN student_video_progress svp
        ON svp.video_id = cv.id
       AND svp.student_id = $1
      WHERE e.student_id = $1 AND c.is_active = true
      GROUP BY c.id, u.full_name
      `,
      [studentId]
    );

    const courses = result.rows.map((course) => {
      const total = Number(course.total_videos);
      const completed = Number(course.completed_videos);

      return {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor_name: course.instructor_name,
        enrolled: true,
        progress_percentage:
          total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });

    res.json(courses);
  } catch (err) {
    console.error("Get enrolled courses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * =========================
 * Get student stats: total enrolled courses, total time spent, total completed courses
 * =========================
 */
router.get(
  "/stats",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;

      /**
       * Total enrolled courses
       */
      
      const enrolledRes = await db.query(
      `
      SELECT COUNT(*) 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
      AND c.is_active = true
      `,
      [studentId]
    );
      /**
       * 2️⃣ Total time spent (seconds)
       */
      const timeRes = await db.query(
        `
        SELECT COALESCE(SUM(watched_duration), 0) AS total_time
        FROM student_video_progress
        WHERE student_id = $1
        `,
        [studentId]
      );

      /**
       * 3️⃣ Total completed courses (NEW LOGIC)
       */
      const completedRes = await db.query(
        `
        SELECT COUNT(*)
        FROM enrollments
        WHERE student_id = $1
          AND completed = true
        `,
        [studentId]
      );

      res.json({
        total_enrolled_courses: Number(enrolledRes.rows[0].count),
        total_completed_courses: Number(completedRes.rows[0].count),
        total_time_spent_seconds: Number(timeRes.rows[0].total_time),
        total_time_spent_hours: Math.round(
          Number(timeRes.rows[0].total_time) / 3600
        )
      });

    } catch (err) {
      console.error("Student stats error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);




export default router;
