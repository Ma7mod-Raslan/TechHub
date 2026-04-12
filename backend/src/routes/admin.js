import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import {
    getDashboardStats,
    getInstructors,
    getStudents,
    toggleUserStatus
} from "../services/admin.service.js";

const router = express.Router();

// GET Dahboard stats
router.get(
  "/dashboard/stats",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const stats = await getDashboardStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET Instructors data
router.get(
  "/instructors",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const instructors = await getInstructors();
      res.json(instructors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET Students data
router.get(
  "/students",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const students = await getStudents();
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Suspend Action
router.patch(
  "/users/:id/toggle-status",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;

      const updatedUser = await toggleUserStatus(userId);

      res.json({
        message: `User ${
          updatedUser.is_active ? "activated" : "suspended"
        } successfully`,
        user: updatedUser
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;