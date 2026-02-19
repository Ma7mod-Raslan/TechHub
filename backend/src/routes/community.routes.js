const express = require("express");
const router = express.Router();
const communityService = require("../services/community.service");
const authMiddleware = require("../middleware/auth"); 
const checkCommunityMember = require("../middleware/communityMember.middleware");

// GET my communities
router.get("/", authMiddleware, async (req, res) => {
  try {
    const data = await communityService.getUserCommunities(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET posts in community
router.get("/:id/posts", authMiddleware, checkCommunityMember, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const posts = await communityService.getCommunityPosts(
      req.params.id,
      limit,
      offset
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE post
router.post("/:id/posts", authMiddleware, checkCommunityMember, async (req, res) => {
  try {
    const post = await communityService.createPost(
      req.params.id,
      req.user.id,
      req.body.content
    );
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
