import express from "express";
import assignmentService from "../services/assignment.service.js";
import { authMiddleware } from "../middleware/auth.js";
import { 
  createAdminNotification,
  createNotification
 } from "../services/notification.service.js";

const router = express.Router();

/* =========================================================
   👨‍🎓 STUDENT ROUTES
========================================================= */

/**
 * GET all assignments for all enrolled courses (Student Dashboard)
 */
router.get(
  "/student/all",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const studentId = req.user.id;

      const data =
        await assignmentService.getAllAssignmentsForStudentDashboard(
          studentId
        );

      res.json(data);

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET Assugnment Details
 */

router.get(
  "/student/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;

      const assignment =
        await assignmentService.getAssignmentDetailsForStudent(
          assignmentId,
          req.user.id
        );

      res.json(assignment);

    } catch (error) {
      next(error);
    }
  }
);


/**
 * POST submit assignment
 */
router.post(
  "/:assignmentId/submit",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;
      const studentId = req.user.id;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          message: "Answers are required",
        });
      }

      const result =
        await assignmentService.submitAssignment(
          assignmentId,
          studentId,
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
 * GET student attempts
 */
router.get(
  "/:assignmentId/attempts",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;
      const studentId = req.user.id;

      const attempts =
        await assignmentService.getStudentAttempts(
          assignmentId,
          studentId
        );

      res.json(attempts);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:assignmentId/attempts/:attemptId",
  authMiddleware,
  async (req, res, next) => {

    try {

      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId, attemptId } = req.params;

      const result =
        await assignmentService.getAttemptDetails(
          assignmentId,
          attemptId,
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
   (Basic structure – expand later)
========================================================= */

/**
 * POST create assignment
 */
router.post(
  "/",
  authMiddleware,
  async (req, res, next) => {
    try {

      const userId = req.user.id;
      const courseTitle = req.title;

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
        return res.status(400).json({
          message: "course_id and title are required",
        });
      }

      const result =
        await assignmentService.createAssignment({
          course_id,
          title,
          description,
          passing_percentage,
          max_attempts,
          instructor_id: req.user.id
        });

        // Notification 
      await createNotification(
      userId,
      "Assignment Added",
      `Assignment Added successfully for ${courseTitle} course`,
      "ASSIGNMENT_ADDED"
    );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST add question to assignment
 */
router.post(
  "/:assignmentId/question",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;
      const { question_text } = req.body;

      if (!question_text) {
        return res.status(400).json({
          message: "Question text is required",
        });
      }

      const result =
        await assignmentService.addQuestion(
          assignmentId,
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
 * POST add options to question
 */
router.post(
  "/question/:questionId/options",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { questionId } = req.params;
      const { options } = req.body;

      /*
        Expected format:
        options: [
          { option_text: "A", is_correct: false },
          { option_text: "B", is_correct: true }
        ]
      */

      if (!options || !Array.isArray(options)) {
        return res.status(400).json({
          message: "Options array is required",
        });
      }

      const result =
        await assignmentService.addOptions(
          questionId,
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
 * Edit Question
 */
router.put(
  "/question/:questionId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { questionId } = req.params;
      const { question_text, options } = req.body;

      const result = await assignmentService.updateQuestion(
        questionId,
        {
          question_text,
          options
        },
        req.user.id
      );

      res.json({
        message: "Question updated successfully",
        data: result
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete Question
 */
router.delete(
  "/question/:questionId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { questionId } = req.params;

      const result = await assignmentService.deleteQuestion(
        questionId,
        req.user.id
      );

      res.json({
        message: "Question deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get Assignment to Edit
 */
router.get(
  "/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;

      const assignment =
        await assignmentService.getAssignmentDetailsForInstructor(
          assignmentId,
          req.user.id
        );

      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete Assignment
 */
router.delete(
  "/:assignmentId",
  authMiddleware,
  async (req, res, next) => {
    try {

      const userId = req.user.id;

      if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { assignmentId } = req.params;

      const result = await assignmentService.deleteAssignment(
        assignmentId,
        req.user.id
      );

      // Notification 
      await createNotification(
      userId,
      "Assignment Deleted",
      `Assignment deleted successfully`,
      "ASSIGNMENT_DELETED"
    );

      res.json({
        message: "Assignment deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;