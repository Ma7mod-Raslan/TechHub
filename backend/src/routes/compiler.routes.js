import express from "express";
import { executeCode } from "../services/compiler.service.js";
import { languageMap } from "../utils/languageMap.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/run", authMiddleware, async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;

    if (!source_code || !language) {
      return res.status(400).json({
        error: "source_code and language are required"
      });
    }

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        error: "Unsupported language"
      });
    }

    const result = await executeCode({
      source_code,
      language_id,
      stdin
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;