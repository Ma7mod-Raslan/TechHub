import express from "express";
import communityService from "../services/community.service.js";
import { authMiddleware } from "../middleware/auth.js";
import checkCommunityMember from "../middleware/communityMember.middleware.js";

const router = express.Router();

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

// GET posts
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

// GET replies
router.get("/posts/:postId/replies", authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const replies = await communityService.getPostReplies(
      req.params.postId,
      limit,
      offset
    );

    res.json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST reply
router.post("/posts/:postId/replies", authMiddleware, async (req, res) => {
  try {
    const reply = await communityService.createReply(
      req.params.postId,
      req.user.id,
      req.body.content
    );

    res.status(201).json(reply);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});



export default router;
