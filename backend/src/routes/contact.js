import { sendContactMessage } from "../services/contact.service.js";

router.post(
  "/contact",
  authMiddleware, // optional 
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