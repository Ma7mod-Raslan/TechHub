import pool from "../db.js";
import notificationService from "./notification.service.js";

const getUserCommunities = async (userId) => {
  const result = await pool.query(
    `
    SELECT c.id,
           c.members_count,
           c.posts_count,
           courses.title,
           courses.thumbnail,
           courses.category
    FROM communities c
    JOIN community_members cm ON cm.community_id = c.id
    JOIN courses ON courses.id = c.course_id
    WHERE cm.user_id = $1 AND c.is_active = true
    `,
    [userId]
  );

  return result.rows;
};

const getCommunityPosts = async (communityId, userId, limit, offset) => {
  const result = await pool.query(
    `
    SELECT 
        p.*,
        u.full_name,
        u.profile_image,

        -- 🔥 نحسب عدد الردود الصح
        (
          SELECT COUNT(*)::int
          FROM community_replies r
          WHERE r.post_id = p.id
          AND r.is_deleted = false
        ) AS replies_count,

        EXISTS (
          SELECT 1 
          FROM community_likes cl
          WHERE cl.post_id = p.id 
          AND cl.user_id = $4
        ) AS is_liked_by_me

    FROM community_posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.community_id = $1 
    AND p.is_deleted = false
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [communityId, limit, offset, userId]
  );

  return result.rows;
};

const createPost = async (communityId, userId, content) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // create post
    const postResult = await client.query(
      `
      INSERT INTO community_posts (community_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [communityId, userId, content]
    );

    // update posts count
    await client.query(
      `
      UPDATE communities
      SET posts_count = posts_count + 1
      WHERE id = $1
      `,
      [communityId]
    );

    await client.query("COMMIT");

    const newPostId = postResult.rows[0].id;

    // get full post
    const fullPost = await client.query(
      `
      SELECT p.*,
            u.full_name,
            u.profile_image,
            false AS is_liked_by_me
      FROM community_posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = $1
      `,
      [newPostId]
    );

    // Notification Logic

    // get user role
    const user = await client.query(
      `SELECT full_name, role FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows[0].role === "student") {
      // get instructor from course via community
      const course = await client.query(
        `
        SELECT c.instructor_id, c.title
        FROM communities cm
        JOIN courses c ON c.id = cm.course_id
        WHERE cm.id = $1
        `,
        [communityId]
      );

      if (course.rows.length > 0) {
        await notificationService.createNotification(
          course.rows[0].instructor_id,
          "New Post",
          `Student ${user.rows[0].full_name} posted in your course "${course.rows[0].title}" community`,
          "community_post",
          communityId
        );
      }
    }

    return fullPost.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const createReply = async (postId, userId, content) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ تأكد إن البوست موجود وهات community_id
    const postResult = await client.query(
      `
      SELECT id, community_id, user_id
      FROM community_posts
      WHERE id = $1 AND is_deleted = false
      `,
      [postId]
    );
    const postOwnerId = postResult.rows[0].user_id;

    if (postResult.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Post not found");
    }

    const communityId = postResult.rows[0].community_id;

    // 2️⃣ تأكد إن المستخدم عضو في نفس الـ community
    const memberCheck = await client.query(
      `
      SELECT 1
      FROM community_members
      WHERE community_id = $1 AND user_id = $2
      `,
      [communityId, userId]
    );

    if (memberCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Not a community member");
    }

    // 3️⃣ إدخال الرد
    const replyResult = await client.query(
      `
      WITH inserted_reply AS (
        INSERT INTO community_replies (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      )
      SELECT r.*, u.full_name, u.profile_image
      FROM inserted_reply r
      JOIN users u ON u.id = r.user_id;
      `,
      [postId, userId, content]
    );

    // 4️⃣ تحديث replies_count
    await client.query(
      `
      UPDATE community_posts
      SET replies_count = replies_count + 1
      WHERE id = $1
      `,
      [postId]
    );

    await client.query("COMMIT");

      // notification
      if (postOwnerId !== userId) {
        await notificationService.createNotification(
          postOwnerId,
          "New Reply",
          `${replyResult.rows[0].full_name} replied to your post`,
          "community_reply",
          postId
        );
      }

      return replyResult.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getPostReplies = async (postId, limit, offset, userId) => {
  const result = await pool.query(
    `
    SELECT r.*,
           u.full_name,
           u.profile_image,
           EXISTS (
             SELECT 1 FROM community_likes cl
             WHERE cl.reply_id = r.id AND cl.user_id = $4
           ) AS is_liked_by_me
    FROM community_replies r
    JOIN users u ON u.id = r.user_id
    WHERE r.post_id = $1 AND r.is_deleted=false
    ORDER BY r.created_at ASC
    LIMIT $2 OFFSET $3
    `,
    [postId, limit, offset, userId] 
  );

  return result.rows;
};


const togglePostLike = async (postId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    
    const postResult = await client.query(
      `
      SELECT community_id
      FROM community_posts
      WHERE id = $1 AND is_deleted = false
      `,
      [postId]
    );

    if (postResult.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Post not found");
    }

    const communityId = postResult.rows[0].community_id;

    const memberCheck = await client.query(
      `
      SELECT 1 FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [communityId, userId]
    );

    if (memberCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      throw new Error("Not a community member");
    }

    const likeCheck = await client.query(
      `
      SELECT id FROM community_likes
      WHERE post_id=$1 AND user_id=$2
      `,
      [postId, userId]
    );

    if (likeCheck.rows.length > 0) {
      // Unlike
      await client.query(
        `
        DELETE FROM community_likes
        WHERE post_id=$1 AND user_id=$2
        `,
        [postId, userId]
      );

      await client.query(
        `
        UPDATE community_posts
        SET likes_count = likes_count - 1
        WHERE id=$1
        `,
        [postId]
      );

      await client.query("COMMIT");
      return { liked: false };
    } else {
      // Like
      await client.query(
        `
        INSERT INTO community_likes (user_id, post_id)
        VALUES ($1, $2)
        `,
        [userId, postId]
      );

      await client.query(
        `
        UPDATE community_posts
        SET likes_count = likes_count + 1
        WHERE id=$1
        `,
        [postId]
      );

      await client.query("COMMIT");
      return { liked: true };
    }

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const toggleReplyLike = async (replyId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ هات community_id من reply
    const replyResult = await client.query(
      `
      SELECT r.post_id, p.community_id
      FROM community_replies r
      JOIN community_posts p ON p.id = r.post_id
      WHERE r.id=$1 AND r.is_deleted=false
      `,
      [replyId]
    );

    if (replyResult.rows.length === 0) {
      throw new Error("Reply not found");
    }

    const communityId = replyResult.rows[0].community_id;

    // 2️⃣ تأكد إن user عضو
    const memberCheck = await client.query(
      `
      SELECT 1 FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [communityId, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error("Not a community member");
    }

    // 3️⃣ هل already liked؟
    const likeCheck = await client.query(
      `
      SELECT id FROM community_likes
      WHERE reply_id=$1 AND user_id=$2
      `,
      [replyId, userId]
    );

    if (likeCheck.rows.length > 0) {
      // Unlike
      await client.query(
        `
        DELETE FROM community_likes
        WHERE reply_id=$1 AND user_id=$2
        `,
        [replyId, userId]
      );

      await client.query(
        `
        UPDATE community_replies
        SET likes_count = likes_count - 1
        WHERE id=$1
        `,
        [replyId]
      );

      await client.query("COMMIT");
      return { liked: false };
    } else {
      // Like
      await client.query(
        `
        INSERT INTO community_likes (user_id, reply_id)
        VALUES ($1, $2)
        `,
        [userId, replyId]
      );

      await client.query(
        `
        UPDATE community_replies
        SET likes_count = likes_count + 1
        WHERE id=$1
        `,
        [replyId]
      );

      await client.query("COMMIT");
      return { liked: true };
    }

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


const editPost = async (postId, userId, content) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const post = await client.query(
      `
      SELECT user_id, community_id
      FROM community_posts
      WHERE id=$1 AND is_deleted=false
      `,
      [postId]
    );

    if (post.rows.length === 0) {
      throw new Error("Post not found");
    }

    const { user_id, community_id } = post.rows[0];

    // فقط صاحب البوست يقدر يعدل
    if (user_id !== userId) {
      throw new Error("Not allowed to edit this post");
    }

    const updated = await client.query(
      `
      UPDATE community_posts
      SET content=$1, updated_at=NOW()
      WHERE id=$2
      RETURNING *
      `,
      [content, postId]
    );

    await client.query("COMMIT");
    return updated.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const deletePost = async (postId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const post = await client.query(
      `
      SELECT user_id, community_id
      FROM community_posts
      WHERE id=$1 AND is_deleted=false
      `,
      [postId]
    );

    if (post.rows.length === 0) {
      throw new Error("Post not found");
    }

    const { user_id, community_id } = post.rows[0];

    // هل user admin؟
    const roleCheck = await client.query(
      `
      SELECT role FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [community_id, userId]
    );

    if (roleCheck.rows.length === 0) {
      throw new Error("Not a community member");
    }

    const role = roleCheck.rows[0].role;

    // مسموح لو owner أو admin
    if (user_id !== userId && role !== "admin") {
      throw new Error("Not allowed to delete this post");
    }

    await client.query(
      `
      UPDATE community_posts
      SET is_deleted=true
      WHERE id=$1
      `,
      [postId]
    );

    await client.query("COMMIT");

    return { message: "Post deleted" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const editReply = async (replyId, userId, content) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reply = await client.query(
      `
      SELECT user_id
      FROM community_replies
      WHERE id=$1 AND is_deleted=false
      `,
      [replyId]
    );

    if (reply.rows.length === 0) {
      throw new Error("Reply not found");
    }

    if (reply.rows[0].user_id !== userId) {
      throw new Error("Not allowed to edit this reply");
    }

    const updated = await client.query(
      `
      UPDATE community_replies
      SET content=$1
      WHERE id=$2
      RETURNING *
      `,
      [content, replyId]
    );

    await client.query("COMMIT");
    return updated.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const deleteReply = async (replyId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reply = await client.query(
      `
      SELECT r.user_id, p.community_id
      FROM community_replies r
      JOIN community_posts p ON p.id = r.post_id
      WHERE r.id=$1 AND r.is_deleted=false
      `,
      [replyId]
    );

    if (reply.rows.length === 0) {
      throw new Error("Reply not found");
    }

    const { user_id, community_id } = reply.rows[0];

    const roleCheck = await client.query(
      `
      SELECT role FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [community_id, userId]
    );

    if (roleCheck.rows.length === 0) {
      throw new Error("Not a community member");
    }

    const role = roleCheck.rows[0].role;

    if (user_id !== userId && role !== "admin") {
      throw new Error("Not allowed to delete this reply");
    }

    await client.query(
      `
      UPDATE community_replies
      SET is_deleted=true
      WHERE id=$1
      `,
      [replyId]
    );

    await client.query("COMMIT");

    return { message: "Reply deleted" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const reportPost = async (postId, userId, category, reason = null) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check post exists
    const post = await client.query(
      `
      SELECT user_id, community_id
      FROM community_posts
      WHERE id=$1 AND is_deleted=false
      `,
      [postId]
    );

    if (post.rows.length === 0) {
      throw new Error("Post not found");
    }

    const { user_id: ownerId, community_id } = post.rows[0];

    if (ownerId === userId) {
      throw new Error("You cannot report your own post");
    }

    // Check membership
    const memberCheck = await client.query(
      `
      SELECT 1 FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [community_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error("Not a community member");
    }

    // Prevent duplicate
    const exists = await client.query(
      `
      SELECT id FROM community_reports
      WHERE post_id=$1 AND user_id=$2
      `,
      [postId, userId]
    );

    if (exists.rows.length > 0) {
      throw new Error("Already reported");
    }

    // Insert report
    await client.query(
      `
      INSERT INTO community_reports (user_id, post_id, category, reason)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, postId, category, reason]
    );

    await client.query("COMMIT");

    return { message: "Post reported successfully" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const reportReply = async (replyId, userId, category, reason = null) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check reply exists
    const reply = await client.query(
      `
      SELECT r.user_id, p.community_id
      FROM community_replies r
      JOIN community_posts p ON p.id = r.post_id
      WHERE r.id=$1 AND r.is_deleted=false
      `,
      [replyId]
    );

    if (reply.rows.length === 0) {
      throw new Error("Reply not found");
    }

    const { user_id: ownerId, community_id } = reply.rows[0];

    if (ownerId === userId) {
      throw new Error("You cannot report your own reply");
    }

    // Check membership
    const memberCheck = await client.query(
      `
      SELECT 1 FROM community_members
      WHERE community_id=$1 AND user_id=$2
      `,
      [community_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      throw new Error("Not a community member");
    }

    // Prevent duplicate
    const exists = await client.query(
      `
      SELECT id FROM community_reports
      WHERE reply_id=$1 AND user_id=$2
      `,
      [replyId, userId]
    );

    if (exists.rows.length > 0) {
      throw new Error("Already reported");
    }

    // Insert report
    await client.query(
      `
      INSERT INTO community_reports (user_id, reply_id, category, reason)
      VALUES ($1, $2, $3, $4)
      `,
      [userId, replyId, category, reason]
    );

    await client.query("COMMIT");

    return { message: "Reply reported successfully" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getCommunityReports = async (communityId, userId) => {
  const roleCheck = await pool.query(
    `
    SELECT role FROM community_members
    WHERE community_id=$1 AND user_id=$2
    `,
    [communityId, userId]
  );

  if (roleCheck.rows.length === 0 || roleCheck.rows[0].role !== "admin") {
    throw new Error("Not authorized");
  }

  const result = await pool.query(
    `
    SELECT r.*, u.full_name
    FROM community_reports r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN community_posts p ON p.id = r.post_id
    LEFT JOIN community_replies rep ON rep.id = r.reply_id
    WHERE p.community_id=$1 OR rep.post_id IN
      (SELECT id FROM community_posts WHERE community_id=$1)
    ORDER BY r.created_at DESC
    `,
    [communityId]
  );

  return result.rows;
};


export default {
  getUserCommunities,
  getCommunityPosts,
  createPost,
  createReply,
  getPostReplies,
  togglePostLike,
  toggleReplyLike,
  editPost,
  deletePost,
  editReply,
  deleteReply,
  reportPost,
  reportReply,
  getCommunityReports
};
