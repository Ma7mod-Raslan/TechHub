import express from "express";
import { 
  sendContactMessage,
  createFeedback,
  getAllFeedbacks
} from "../services/contact.service.js";
import { authMiddleware } from "../middleware/auth.js"; // ✅ fix

const router = express.Router();

router.post(
  "/contact",
  async (req, res) => {
    try {
      const result = await sendContactMessage(
        req.body,
        req.user?.id || null
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// add feedback
router.post(
  "/feedback",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await createFeedback(
        req.body,
        req.user.id
      );

      res.json(result);

    } catch (err) {
      res.status(400).json({
        error: err.message
      });
    }
  }
);


// get all feedbacks
router.get(
  "/feedbacks",
  async (req, res) => {
    try {
      const result = await getAllFeedbacks();

      res.json(result);

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;