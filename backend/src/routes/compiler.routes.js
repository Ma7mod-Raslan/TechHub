import express from "express";
import rateLimit from "express-rate-limit";
import { executeCode } from "../services/compiler.service.js";
import { languageMap } from "../utils/languageMap.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const compilerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // max 10 runs per user per minute
  message: { error: "Too many requests, please slow down." },
});

router.get("/languages", (req, res) => {
  res.json(languageMap);
});

router.post("/run", authMiddleware, compilerLimiter, async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;

    if (!source_code || !language) {
      return res.status(400).json({
        error: "source_code and language are required",
      });
    }

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        error: "Unsupported language",
      });
    }

    const result = await executeCode({ source_code, language_id, stdin });

    res.json(result);
  } catch (err) {
    // ✅ Fix #4: return 408 for timeout instead of generic 500
    const status = err.message === "Execution timeout" ? 408 : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;