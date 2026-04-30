import db from "../db.js";
import { transporter } from "./mail.js";
import { uploadProfileImage } from "./cloudinary.js";


// Dashboard Stats
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalInstructors,
    activeCourses,
    reports,

    usersGrowth,
    instructorsGrowth,
    coursesThisWeek,
    pendingReports
  ] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM users`),

    db.query(`SELECT COUNT(*) FROM users WHERE role = 'instructor'`),

    db.query(`SELECT COUNT(*) FROM courses WHERE is_active = true AND status = 'Published'`),

    db.query(`SELECT COUNT(*) FROM community_reports`),

    // users growth
    db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS current_month,
        COUNT(*) FILTER (
          WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
          AND created_at < date_trunc('month', CURRENT_DATE)
        ) AS last_month
      FROM users
    `),

    // instructors growth
    db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS current_month,
        COUNT(*) FILTER (
          WHERE created_at >= date_trunc('month', CURRENT_DATE - interval '1 month')
          AND created_at < date_trunc('month', CURRENT_DATE)
        ) AS last_month
      FROM users
      WHERE role = 'instructor'
    `),

    // courses this week
    db.query(`
      SELECT COUNT(*) FROM courses
      WHERE created_at >= date_trunc('week', CURRENT_DATE)
    `),

    // pending reports
    db.query(`
      SELECT COUNT(*) FROM community_reports
      WHERE status = 'pending'
    `)
  ]);

  // helper function
  const calcGrowth = (current, last) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
  };

  const usersCurrent = Number(usersGrowth.rows[0].current_month);
  const usersLast = Number(usersGrowth.rows[0].last_month);

  const instructorsCurrent = Number(instructorsGrowth.rows[0].current_month);
  const instructorsLast = Number(instructorsGrowth.rows[0].last_month);

  return {
    totalUsers: {
      value: Number(totalUsers.rows[0].count),
      growth: calcGrowth(usersCurrent, usersLast)
    },

    totalInstructors: {
      value: Number(totalInstructors.rows[0].count),
      growth: calcGrowth(instructorsCurrent, instructorsLast)
    },

    activeCourses: {
      value: Number(activeCourses.rows[0].count),
      thisWeek: Number(coursesThisWeek.rows[0].count)
    },

    reports: {
      value: Number(reports.rows[0].count),
      pending: Number(pendingReports.rows[0].count)
    }
  };
};

// Instructors data
export const getInstructors = async () => {
  const result = await db.query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      u.is_active,
      COUNT(c.id) AS courses_count
    FROM users u
    LEFT JOIN courses c 
      ON u.id = c.instructor_id
    WHERE u.role = 'instructor'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return result.rows;
};

// Students data
export const getStudents = async () => {
  const result = await db.query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      u.is_active,
      COUNT(e.id) AS enrolled_courses
    FROM users u
    LEFT JOIN enrollments e 
      ON u.id = e.student_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return result.rows;
};

// Toggle Suspend user
export const toggleUserStatus = async (userId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Get user
    const userResult = await client.query(
      `SELECT id, is_active, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];

    // Prevent admin suspend
    if (user.role === "admin") {
      throw new Error("Cannot suspend an admin");
    }

    // Toggle status
    const newStatus = !user.is_active;

    // Update user
    const updateResult = await client.query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
       RETURNING id, full_name, email, role, is_active`,
      [newStatus, userId]
    );

    // If instructor → cascade suspend
    if (user.role === "instructor") {


      // Suspend Courses
      await client.query(
        `UPDATE courses
         SET is_active = $1
         WHERE instructor_id = $2`,
        [newStatus, userId]
      );

      // Suspend Communities
      await client.query(
      `UPDATE communities
      SET is_active = $1
      WHERE course_id IN (
        SELECT id FROM courses WHERE instructor_id = $2
      )`,
      [newStatus, userId]
    );
    }

    await client.query("COMMIT");

    return updateResult.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get Courses Data
export const getAllCourses = async () => {
  const result = await db.query(`
  SELECT 
    c.id,
    c.title AS course_name,
    c.category,
    u.full_name AS instructor_name,
    COUNT(e.id) AS enrolled_students,
    CASE 
      WHEN c.is_active = true AND c.status = 'Published' THEN 'active'
      ELSE 'inactive'
    END AS status
  FROM courses c
  LEFT JOIN users u 
    ON c.instructor_id = u.id
  LEFT JOIN enrollments e 
    ON c.id = e.course_id
  WHERE c.status = 'Published'
  GROUP BY c.id, u.full_name
  ORDER BY c.created_at DESC;
  `);

  return result.rows;
};

// Toggle Suspend course
export const toggleCourseStatus = async (courseId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Get course + instructor
    const courseResult = await client.query(
      `
      SELECT c.id, c.is_active, c.instructor_id,
             u.is_active AS instructor_active
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.id = $1
      `,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      throw new Error("Course not found");
    }

    const course = courseResult.rows[0];

    // Toggle
    const newStatus = !course.is_active;

    if (newStatus === true && course.instructor_active === false) {
      throw new Error("Cannot activate course: instructor is suspended");
    }

    // Update course
    const updatedCourse = await client.query(
      `
      UPDATE courses
      SET is_active = $1
      WHERE id = $2
      RETURNING id, title, is_active
      `,
      [newStatus, courseId]
    );

    // Cascade to communities
    await client.query(
      `
      UPDATE communities
      SET is_active = $1
      WHERE course_id = $2
      `,
      [newStatus, courseId]
    );

    await client.query("COMMIT");

    return updatedCourse.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Delete course 
export const deleteCourse = async (courseId) => {
  const result = await db.query(
    `DELETE FROM courses
     WHERE id = $1
     RETURNING id, title`,
    [courseId]
  );

  if (result.rows.length === 0) {
    throw new Error("Course not found");
  }

  return result.rows[0];
};

// Get full info for the course 
export const getCourseFullDetails = async (courseId) => {
  
  const courseRes = await db.query(
    `
    SELECT
      c.id,
      c.title,
      c.description,
      c.thumbnail,
      c.category,
      c.level,
      c.is_active,
      u.full_name AS instructor_name,
      COUNT(e.id) AS enrolled_students
    FROM courses c
    JOIN users u ON u.id = c.instructor_id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = $1
    GROUP BY c.id, u.full_name;
    `,
    [courseId]
  );

  if (courseRes.rows.length === 0) {
    throw new Error("Course not found");
  }

  const course = courseRes.rows[0];

  const [
    videosRes,
    durationRes,
    outcomesRes,
    requirementsRes
  ] = await Promise.all([
    db.query(
      `
      SELECT id, title, description, duration, video_url
      FROM course_videos
      WHERE course_id = $1
      ORDER BY video_order ASC
      `,
      [courseId]
    ),
    db.query(
      `
      SELECT COALESCE(SUM(duration), 0) AS total_duration
      FROM course_videos
      WHERE course_id = $1
      `,
      [courseId]
    ),
    db.query(
      `
      SELECT description
      FROM course_outcomes
      WHERE course_id = $1
      ORDER BY id ASC
      `,
      [courseId]
    ),
    db.query(
      `
      SELECT description
      FROM course_requirements
      WHERE course_id = $1
      ORDER BY id ASC
      `,
      [courseId]
    )
  ]);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    category: course.category,
    level: course.level,
    instructor_name: course.instructor_name,

    // status
    status: course.is_active ? "active" : "inactive",

    total_duration: Number(durationRes.rows[0].total_duration),
    outcomes: outcomesRes.rows.map(o => o.description),
    requirements: requirementsRes.rows.map(r => r.description),
    videos: videosRes.rows
  };
};

// Get Communities
export const getCommunities = async () => {
  const result = await db.query(`
    SELECT
      com.id,
      com.is_active,
      c.title AS course_name,
      c.category,
      u.full_name AS instructor_name,
      com.members_count,
      com.posts_count
    FROM communities com
    JOIN courses c ON com.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    ORDER BY com.created_at DESC
  `);

  return result.rows;
};

// Get Specific Community
export const getCommunityDetails = async (communityId) => {

  const communityRes = await db.query(
    `
    SELECT
      com.id,
      com.members_count,
      com.posts_count,
      c.is_active
    FROM communities com
    JOIN courses c ON com.course_id = c.id
    WHERE com.id = $1
    `,
    [communityId]
  );

  if (communityRes.rows.length === 0) {
    throw new Error("Community not found");
  }

  const community = communityRes.rows[0];

  const postsRes = await db.query(
    `
    SELECT
      p.id,
      p.content,
      p.created_at,
      p.likes_count,
      p.replies_count,
      p.is_hidden,
      u.full_name AS sender_name
    FROM community_posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.community_id = $1
      AND p.is_deleted = false
    ORDER BY p.created_at DESC
    LIMIT 10
    `,
    [communityId]
  );

  return {
    community_id: community.id,

    // Main info
    members: community.members_count,
    total_posts: community.posts_count,
    status: community.is_active ? "active" : "inactive",

    // Posts
    recent_posts: postsRes.rows.map(post => ({
      id: post.id,
      sender_name: post.sender_name,
      content: post.content,
      time: post.created_at,
      total_likes: post.likes_count,
      total_replies: post.replies_count,
      is_hidden: post.is_hidden
    }))
  };
};

// Toggle hide/unhide for post
export const togglePostHide = async (postId, adminId) => {
  // Check post exists
  const postRes = await db.query(
    `SELECT id, is_hidden, is_deleted FROM community_posts WHERE id = $1`,
    [postId]
  );

  if (postRes.rows.length === 0) {
    throw new Error("Post not found");
  }

  const post = postRes.rows[0];

  if (post.is_deleted) {
    throw new Error("Cannot modify deleted post");
  }

  // Toggle
  const newStatus = !post.is_hidden;

  const updated = await db.query(
    `UPDATE community_posts
     SET is_hidden = $1
     WHERE id = $2
     RETURNING id, content, is_hidden`,
    [newStatus, postId]
  );

  return updated.rows[0];
};

// Get Replies for post
export const getPostReplies = async (postId) => {
  const result = await db.query(
    `
    SELECT
      r.id,
      r.content,
      r.created_at,
      r.likes_count,
      r.is_deleted,
      u.full_name AS sender_name,

      -- status
      CASE
        WHEN r.is_deleted = true THEN 'deleted'
        WHEN r.is_hidden = true THEN 'hidden'
        ELSE 'visible'
      END AS status

    FROM community_replies r
    JOIN users u ON r.user_id = u.id
    WHERE r.post_id = $1
    ORDER BY r.created_at ASC
    `,
    [postId]
  );

  return result.rows;
};

// Delete Reply
export const deleteReply = async (replyId) => {
  // 1️⃣ check if reply exists
  const replyRes = await db.query(
    `SELECT id, is_deleted FROM community_replies WHERE id = $1`,
    [replyId]
  );

  if (replyRes.rows.length === 0) {
    throw new Error("Reply not found");
  }

  const reply = replyRes.rows[0];

  if (reply.is_deleted) {
    throw new Error("Reply already deleted");
  }

  // 2️⃣ soft delete
  const result = await db.query(
    `
    UPDATE community_replies
    SET is_deleted = true
    WHERE id = $1
    RETURNING id, content
    `,
    [replyId]
  );

  return result.rows[0];
};

// Delete post (soft delete)
export const deletePost = async (postId) => {
  const result = await db.query(
    `UPDATE community_posts
     SET is_deleted = true
     WHERE id = $1
     RETURNING id, content`,
    [postId]
  );

  if (result.rows.length === 0) {
    throw new Error("Post not found");
  }

  return result.rows[0];
};

// Get Reports
export const getReports = async () => {
  const result = await db.query(`
    SELECT
      r.id,

      u.full_name AS reporter_name,
      u.email,

      CASE
        WHEN r.post_id IS NOT NULL THEN 'Reported Post'
        ELSE 'Reported Reply'
      END AS type,

      r.category,

      CASE
        WHEN r.post_id IS NOT NULL THEN LEFT(p.content, 100)
        ELSE LEFT(rep.content, 100)
      END AS message_excerpt,

      r.created_at,

      r.status

    FROM community_reports r

    JOIN users u ON r.user_id = u.id

    LEFT JOIN community_posts p 
      ON r.post_id = p.id

    LEFT JOIN community_replies rep 
      ON r.reply_id = rep.id

    ORDER BY r.created_at DESC
  `);

  return result.rows;
};

// Toggle Action for report
export const toggleReportStatus = async (reportId, adminId) => {
  // Check report exists
  const reportRes = await db.query(
    `SELECT id, status FROM community_reports WHERE id = $1`,
    [reportId]
  );

  if (reportRes.rows.length === 0) {
    throw new Error("Report not found");
  }

  const report = reportRes.rows[0];

  // Toggle
  const newStatus = report.status === "pending" ? "resolved" : "pending";

  const updated = await db.query(
    `
    UPDATE community_reports
    SET status = $1,
        resolved_by = $2,
        resolved_at = NOW()
    WHERE id = $3
    RETURNING id, status
    `,
    [newStatus, adminId, reportId]
  );

  return updated.rows[0];
};

// View Action for report
export const getReportDetails = async (reportId) => {
  const result = await db.query(
    `
    SELECT
      r.id,
      r.category,
      r.status,
      r.created_at,

      -- 👤 Reporter
      u.full_name AS reporter_name,
      u.email,

      -- 🧠 Type
      CASE
        WHEN r.post_id IS NOT NULL THEN 'Reported Post'
        ELSE 'Reported Reply'
      END AS type,

      -- 📄 Full content
      CASE
        WHEN r.post_id IS NOT NULL THEN p.content
        ELSE rep.content
      END AS content,

      -- 📎 IDs
      r.post_id,
      r.reply_id

    FROM community_reports r

    JOIN users u ON r.user_id = u.id

    LEFT JOIN community_posts p 
      ON r.post_id = p.id

    LEFT JOIN community_replies rep 
      ON r.reply_id = rep.id

    WHERE r.id = $1
    `,
    [reportId]
  );

  if (result.rows.length === 0) {
    throw new Error("Report not found");
  }

  return result.rows[0];
};

// Delete Report
export const deleteReport = async (reportId) => {
  const result = await db.query(
    `DELETE FROM community_reports WHERE id = $1 RETURNING id`,
    [reportId]
  );

  if (result.rows.length === 0) {
    throw new Error("Report not found");
  }

  return result.rows[0];
};

// Get profile info 
export const getAdminProfile = async (adminId) => {
  const result = await db.query(
    `
    SELECT 
      id,
      full_name,
      email,
      role,
      profile_image,
      bio
    FROM users
    WHERE id = $1 AND role = 'admin'
    `,
    [adminId]
  );

  if (result.rows.length === 0) {
    throw new Error("Admin not found");
  }

  return result.rows[0];
};

// Update Admin Name 
export const updateAdminProfile = async (adminId, name) => {
  const result = await db.query(
    `
    UPDATE users
    SET full_name = $1
    WHERE id = $2 AND role = 'admin'
    RETURNING id, full_name, email, profile_image
    `,
    [name, adminId]
  );

  return result.rows[0];
};

// Update Profile_image
export const updateAdminProfileImage = async (adminId, file) => {
  if (!file) {
    throw new Error("Image is required");
  }

  // Upload to Cloudinary
  const imageUrl = await uploadProfileImage(file.buffer);


  // Update DB (admin only)
  const result = await db.query(
    `UPDATE users
     SET profile_image = $1
     WHERE id = $2 AND role = 'admin'
     RETURNING profile_image`,
    [imageUrl, adminId]
  );

  return result.rows[0];
};

// Mark As Read
export const markAsRead = async (notificationId, userId) => {
  await db.query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1 AND user_id = $2
    `,
    [notificationId, userId]
  );

  return { message: "Marked as read" };
};

// MarkAll As Read
export const markAllAsRead = async (userId) => {
  await db.query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1
    `,
    [userId]
  );

  return { message: "All notifications marked as read" };
};

// Delete Notification
export const deleteNotification = async (notificationId, userId) => {
  const result = await db.query(
    `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
    RETURNING id
    `,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Notification not found or not authorized");
  }

  return { message: "Notification deleted successfully" };
};

// Toggle Hide for Reply
export const toggleReplyHide = async (replyId) => {
  // 1️⃣ check reply exists
  const replyRes = await db.query(
    `
    SELECT id, is_hidden, is_deleted
    FROM community_replies
    WHERE id = $1
    `,
    [replyId]
  );

  if (replyRes.rows.length === 0) {
    throw new Error("Reply not found");
  }

  const reply = replyRes.rows[0];

  if (reply.is_deleted) {
    throw new Error("Cannot modify deleted reply");
  }

  // 2️⃣ toggle hide
  const newStatus = !reply.is_hidden;

  const result = await db.query(
    `
    UPDATE community_replies
    SET is_hidden = $1
    WHERE id = $2
    RETURNING id, content, is_hidden
    `,
    [newStatus, replyId]
  );

  return result.rows[0];
};

// Get All Messages
export const getAllContactMessages = async () => {
  const result = await db.query(`
    SELECT
      id,
      full_name AS name,
      email,
      category AS subject,
      LEFT(message, 100) AS message_preview,
      created_at AS date,
      status
    FROM contact_messages
    ORDER BY created_at DESC
  `);

  return result.rows;
};

// Get Specific message
export const getContactMessageDetails = async (id) => {
  const result = await db.query(
    `
    SELECT
      id,
      full_name AS name,
      email,
      category AS subject,
      message,
      created_at AS date,
      status
    FROM contact_messages
    WHERE id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Message not found");
  }

  return result.rows[0];
};


// Replay to message
export const replyToContactMessage = async (id, replyText) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // validation
    if (!replyText || replyText.trim() === "") {
      throw new Error("Reply message cannot be empty");
    }

    // get message
    const result = await client.query(
      `SELECT full_name, email, category, status 
       FROM contact_messages 
       WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error("Message not found");
    }

    const { full_name, email, category, status } = result.rows[0];

    // prevent double reply
    if (status === "Replied") {
      throw new Error("This message has already been replied to");
    }

    // prepare email
    const subject = `Reply to your ${category} - TechHub`;

    const safeReply = replyText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html = `
      <h2>Hello ${full_name},</h2>
      <p>Thank you for contacting TechHub.</p>
      <p>${safeReply}</p>
      <br/>
      <p>Best regards,<br/>TechHub Support Team</p>
    `;

    // send email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject,
      html
    });

    // update DB
    await client.query(
      `
      UPDATE contact_messages
      SET status = 'replied',
          reply_message = $1
      WHERE id = $2
      `,
      [replyText, id]
    );

    await client.query("COMMIT");

    return { message: "Reply sent successfully" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Delete Specific message
export const deleteContactMessageById = async (id) => {
  const result = await db.query(
    `
    DELETE FROM contact_messages
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Message not found");
  }

  return { message: "Contact message deleted successfully" };
};