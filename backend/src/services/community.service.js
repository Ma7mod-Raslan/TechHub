const pool = require("../db");

const getUserCommunities = async (userId) => {
  const result = await pool.query(
    `
    SELECT c.id,
           c.members_count,
           c.posts_count,
           courses.title,
           courses.thumbnail
    FROM communities c
    JOIN community_members cm ON cm.community_id = c.id
    JOIN courses ON courses.id = c.course_id
    WHERE cm.user_id = $1
    `,
    [userId]
  );

  return result.rows;
};

const getCommunityPosts = async (communityId, limit, offset) => {
  const result = await pool.query(
    `
    SELECT p.*,
           u.full_name,
           u.profile_image
    FROM community_posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.community_id = $1 AND p.is_deleted = false
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [communityId, limit, offset]
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

module.exports = {
  getUserCommunities,
  getCommunityPosts,
  createPost
};
