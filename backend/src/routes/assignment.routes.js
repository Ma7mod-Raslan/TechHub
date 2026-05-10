import express from "express";
import assignmentService from "../services/assignment.service.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createNotification
} from "../services/notification.service.js";

const router = express.Router();

/* =========================================================
   👨‍🎓 STUDENT ROUTES
========================================================= */

/**
 * GET /student/all
 * All assignments across enrolled courses (student dashboard)
 */
router.get(
  "/student/all",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const data = await assignmentService.getAllAssignmentsForStudentDashboard(
        req.user.id
      );

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /student/:assignmentId
 * Assignment details for the student (questions without correct answers).
 * Blocked if course progress < 100% or attempts exhausted.
 */
router.get(
  "/student/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignment = await assignmentService.getAssignmentDetailsForStudent(
        req.params.assignmentId,
        req.user.id
      );

      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /:assignmentId/submit
 * Submit answers for an assignment
 */
router.post(
  "/:assignmentId/submit",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers are required" });
      }

      const result = await assignmentService.submitAssignment(
        req.params.assignmentId,
        req.user.id,
        answers
      );

      res.json({
        message: "Assignment submitted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:assignmentId/attempts
 * All attempts made by the student on an assignment
 */
router.get(
  "/:assignmentId/attempts",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const attempts = await assignmentService.getStudentAttempts(
        req.params.assignmentId,
        req.user.id
      );

      res.json(attempts);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:assignmentId/attempts/:attemptId
 * Detailed review of a specific attempt (shows correct answers)
 */
router.get(
  "/:assignmentId/attempts/:attemptId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await assignmentService.getAttemptDetails(
        req.params.assignmentId,
        req.params.attemptId,
        req.user.id
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   👨‍🏫 INSTRUCTOR ROUTES
========================================================= */

/**
 * POST /
 * Create a new assignment for a course
 */
router.post(
  "/",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const {
        course_id,
        title,
        description,
        passing_percentage,
        max_attempts,
      } = req.body;

      if (!course_id || !title) {
        return res.status(400).json({ message: "course_id and title are required" });
      }

      const result = await assignmentService.createAssignment({
        course_id,
        title,
        description,
        passing_percentage,
        max_attempts,
        instructor_id: req.user.id,
      });

      // BUG FIX #6: courseTitle now comes from the service result, not req.title
      await createNotification(
        req.user.id,
        "Assignment Added",
        `Assignment "${result.title}" added successfully`,
        "ASSIGNMENT_ADDED"
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /:assignmentId/question
 * Add a question to an assignment
 */
router.post(
  "/:assignmentId/question",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { question_text } = req.body;

      if (!question_text) {
        return res.status(400).json({ message: "Question text is required" });
      }

      const result = await assignmentService.addQuestion(
        req.params.assignmentId,
        question_text,
        req.user.id
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /question/:questionId/options
 * Add options to a question
 * Expected body: { options: [{ option_text, is_correct }] }
 */
router.post(
  "/question/:questionId/options",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { options } = req.body;

      if (!options || !Array.isArray(options)) {
        return res.status(400).json({ message: "Options array is required" });
      }

      const result = await assignmentService.addOptions(
        req.params.questionId,
        options,
        req.user.id
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /question/:questionId
 * Edit a question's text and/or options
 */
router.put(
  "/question/:questionId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { question_text, options } = req.body;

      const result = await assignmentService.updateQuestion(
        req.params.questionId,
        { question_text, options },
        req.user.id
      );

      res.json({ message: "Question updated successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /question/:questionId
 * Delete a question (and its options via cascade)
 */
router.delete(
  "/question/:questionId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await assignmentService.deleteQuestion(
        req.params.questionId,
        req.user.id
      );

      res.json({ message: "Question deleted successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:assignmentId
 * Assignment details for the instructor (includes correct answers)
 */
router.get(
  "/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignment = await assignmentService.getAssignmentDetailsForInstructor(
        req.params.assignmentId,
        req.user.id
      );

      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /:assignmentId
 * Delete an assignment entirely
 */
router.delete(
  "/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await assignmentService.deleteAssignment(
        req.params.assignmentId,
        req.user.id
      );

      await createNotification(
        req.user.id,
        "Assignment Deleted",
        "Assignment deleted successfully",
        "ASSIGNMENT_DELETED"
      );

      res.json({ message: "Assignment deleted successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;