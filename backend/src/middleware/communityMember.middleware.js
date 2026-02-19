import pool from "../db.js";

const checkCommunityMember = async (req, res, next) => {
  const userId = req.user.id;
  const communityId = req.params.id;

  try {
    const result = await pool.query(
      `
      SELECT 1 
      FROM community_members
      WHERE community_id = $1 AND user_id = $2
      `,
      [communityId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: "Not a community member" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default checkCommunityMember;
