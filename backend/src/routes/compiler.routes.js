import express from "express";
import { runCode } from "../services/compiler.service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/run", authMiddleware, async (req, res, next) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Missing language or code" });
    }

    const result = await runCode(language, code);

    res.json(result);

  } catch (err) {
    next(err);
  }
});

export default router;