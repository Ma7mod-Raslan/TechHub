import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadProfileImage } from "../services/cloudinary.js";

const router = express.Router();

// Update profile image
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
        "UPDATE users SET profile_image=$1 WHERE id=$2",
        [imageUrl, req.user.id]
      );

      res.json({
        message: "Profile image updated",
        profile_image: imageUrl,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get user profile
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

// Get enrolled courses with progress
router.get(
  "/my-courses",
  authMiddleware,
  async (req, res) => {
    try {
      const studentId = req.user.id;

      /**
       * Get enrolled courses basic info
       */
      const coursesRes = await db.query(
        `
        SELECT
          c.id,
          c.title,
          c.thumbnail,
          u.name AS instructor_name
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.instructor_id
        WHERE e.user_id = $1
        `,
        [studentId]
      );

      const courses = coursesRes.rows;

      /**
       * For each course, compute progress
       */
      for (const course of courses) {
        // total videos in course
        const totalRes = await db.query(
          `
          SELECT COUNT(*) 
          FROM course_videos
          WHERE course_id = $1
          `,
          [course.id]
        );

        // completed videos by student
        const completedRes = await db.query(
          `
          SELECT COUNT(*) 
          FROM student_video_progress svp
          JOIN course_videos cv ON cv.id = svp.video_id
          WHERE svp.student_id = $1
            AND svp.is_completed = true
            AND cv.course_id = $2
          `,
          [studentId, course.id]
        );

        const total = Number(totalRes.rows[0].count);
        const completed = Number(completedRes.rows[0].count);

        course.enrolled = true;
        course.progress_percentage =
          total === 0 ? 0 : Math.round((completed / total) * 100);
      }

      res.json(courses);

    } catch (err) {
      console.error("Get enrolled courses error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


export default router;
