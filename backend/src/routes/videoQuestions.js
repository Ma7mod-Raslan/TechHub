import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import { checkEnrollment } from "../middleware/enrollment.js";



const router = express.Router();

// Instructor only can add questions to videos
router.post(
  "/videos/:videoId/questions",
  authMiddleware,
  allowRoles("instructor"),
  async (req, res) => {
    try {
      const { videoId } = req.params;
      const { question_text, choices } = req.body;

      /*
        choices = [
          { text: "3 * 10^5", is_correct: false },
          { text: "3 * 10^4", is_correct: true },
          ...
        ]
      */

      if (!question_text || !Array.isArray(choices) || choices.length < 2) {
        return res.status(400).json({ error: "Invalid question data" });
      }

      const correctCount = choices.filter(c => c.is_correct).length;
      if (correctCount !== 1) {
        return res.status(400).json({
          error: "Exactly one correct choice is required"
        });
      }

      // create question
      const qRes = await db.query(
        `
        INSERT INTO video_questions (video_id, question_text)
        VALUES ($1, $2)
        RETURNING id
        `,
        [videoId, question_text]
      );

      const questionId = qRes.rows[0].id;

      // create choices
      for (const choice of choices) {
        await db.query(
          `
          INSERT INTO video_question_choices
          (question_id, choice_text, is_correct)
          VALUES ($1, $2, $3)
          `,
          [questionId, choice.text, choice.is_correct]
        );
      }

      res.status(201).json({ message: "Question added successfully" });

    } catch (err) {
      console.error("Add question error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Students can fetch questions for videos they are enrolled in
router.get(
  "/videos/:videoId/questions",
  authMiddleware,
  checkEnrollment,
  async (req, res) => {
    try {
      const { videoId } = req.params;

      const qRes = await db.query(
        `
        SELECT id, question_text
        FROM video_questions
        WHERE video_id=$1
        ORDER BY question_order ASC
        `,
        [videoId]
      );

      const questions = [];

      for (const q of qRes.rows) {
        const cRes = await db.query(
          `
          SELECT id, choice_text
          FROM video_question_choices
          WHERE question_id=$1
          `,
          [q.id]
        );

        questions.push({
          id: q.id,
          question_text: q.question_text,
          choices: cRes.rows
        });
      }

      res.json(questions);

    } catch (err) {
      console.error("Get questions error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Students can submit answers to questions
router.post(
  "/questions/:questionId/answer",
  authMiddleware,
  checkEnrollment,
  async (req, res) => {
    try {
      const { questionId } = req.params;
      const { choice_id } = req.body;

      const resChoice = await db.query(
        `
        SELECT is_correct
        FROM video_question_choices
        WHERE id=$1 AND question_id=$2
        `,
        [choice_id, questionId]
      );

      if (resChoice.rows.length === 0) {
        return res.status(400).json({ error: "Invalid choice" });
      }

      const isCorrect = resChoice.rows[0].is_correct;

      res.json({
        correct: isCorrect,
        message: isCorrect ? "Great Answer 🎉" : "Try Again ❌"
      });

    } catch (err) {
      console.error("Answer question error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
