import pool from "../db.js";

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
    WHERE cm.user_id = $1
    `,
    [userId]
  );

  return result.rows;
};

const getCommunityPosts = async (communityId,userId, limit, offset) => {
  const result = await pool.query(
    `
    SELECT p.*,
        u.full_name,
        u.profile_image,
        EXISTS (
          SELECT 1 FROM community_likes cl
          WHERE cl.post_id = p.id AND cl.user_id = $4
          ) AS is_liked_by_me
      FROM community_posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.community_id = $1 AND p.is_deleted = false
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

    const postResult = await client.query(
      `
      INSERT INTO community_posts (community_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [communityId, userId, content]
    );

    await client.query(
      `
      UPDATE communities
      SET posts_count = posts_count + 1
      WHERE id = $1
      `,
      [communityId]
    );

    await client.query("COMMIT");

    return postResult.rows[0];
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
      SELECT id, community_id
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
      INSERT INTO community_replies (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
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

    return replyResult.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getPostReplies = async (postId, limit, offset) => {
  const result = await pool.query(
    `
    SELECT r.*,
           u.full_name,
           u.profile_image
    FROM community_replies r
    JOIN users u ON u.id = r.user_id
    WHERE r.post_id = $1 AND r.is_deleted = false
    ORDER BY r.created_at ASC
    LIMIT $2 OFFSET $3
    `,
    [postId, limit, offset]
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


export default {
  getUserCommunities,
  getCommunityPosts,
  createPost,
  createReply,
  getPostReplies,
  togglePostLike
};
