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
    const userId = req.user.id;
    console.log("📌 [GET /api/me] Fetching profile for user:", userId);

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
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    console.log("📌 [GET /api/me] User data:", {
      id: user.id,
      role: user.role,
      expertise: user.expertise,
      hasInstructorProfile: user.job_title !== null || user.linkedin !== null || user.expertise !== null
    });

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
        job_title: user.job_title || null,
        linkedin: user.linkedin || null,
        expertise: Array.isArray(user.expertise) ? user.expertise : (user.expertise ? [user.expertise] : []),
      };
      console.log("📌 [GET /api/me] Instructor profile:", response.instructor_profile);
    }

    res.json(response);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

/**
 * =========================
 * Update user profile - مسار موحد (PUT /api/me)
 * =========================
 */
router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, linkedin, expertise, job_title } = req.body;

    console.log("📌 [PUT /api/me] Request body:", { 
      full_name, 
      bio, 
      linkedin, 
      expertise: Array.isArray(expertise) ? expertise.length + " items" : expertise,
      job_title 
    });

    // 1️⃣ تحديث بيانات المستخدم الأساسية
    if (full_name || bio) {
      console.log("📌 Updating user basic info...");
      await db.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             bio = COALESCE($2, bio)
         WHERE id = $3`,
        [full_name || null, bio || null, userId]
      );
    }

    if (expertise !== undefined || linkedin !== undefined || job_title !== undefined) {
      console.log("📌 Updating instructor profile...");
      
      const existing = await db.query(
        'SELECT id FROM instructor_profiles WHERE user_id = $1',
        [userId]
      );

      console.log("📌 Existing instructor profile:", existing.rows.length > 0 ? "YES" : "NO");

      if (existing.rows.length === 0) {

        console.log("📌 Creating new instructor profile...");
        const expertiseArray = Array.isArray(expertise) ? expertise : [];
        console.log("📌 Expertise to save:", expertiseArray);

        await db.query(
          `INSERT INTO instructor_profiles (user_id, expertise, linkedin, job_title) 
           VALUES ($1, $2, $3, $4)`,
          [
            userId,
            expertiseArray,
            linkedin || null,
            job_title || null
          ]
        );
        console.log("✅ Instructor profile created");
      } else {
        
        console.log("📌 Updating existing instructor profile...");
        const expertiseArray = Array.isArray(expertise) ? expertise : undefined;
        console.log("📌 Expertise to update:", expertiseArray);

        await db.query(
          `UPDATE instructor_profiles 
           SET expertise = COALESCE($1, expertise),
               linkedin = COALESCE($2, linkedin),
               job_title = COALESCE($3, job_title)
           WHERE user_id = $4`,
          [
            expertiseArray,
            linkedin || undefined,
            job_title || undefined,
            userId
          ]
        );
        console.log("✅ Instructor profile updated");
      }
    }

    // 3️⃣ أرجع البيانات المحدثة الكاملة
    console.log("📌 Fetching updated profile data...");
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
      [userId]
    );

    if (result.rows.length === 0) {
      console.error("❌ User not found after update");
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    console.log("📌 Updated user data:", {
      id: user.id,
      expertise: user.expertise
    });

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
        job_title: user.job_title || null,
        linkedin: user.linkedin || null,
        expertise: Array.isArray(user.expertise) ? user.expertise : (user.expertise ? [user.expertise] : []),
      };
    }

    res.json({
      message: "Profile updated successfully",
      ...response
    });

  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
});


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
 * Get student stats
 * =========================
 */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;

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

    const timeRes = await db.query(
      `
      SELECT COALESCE(SUM(watched_duration), 0) AS total_time
      FROM student_video_progress
      WHERE student_id = $1
      `,
      [studentId]
    );

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
});

export default router;