import express from "express";
import { sendContactMessage } from "../services/contact.service.js";
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

export default router;