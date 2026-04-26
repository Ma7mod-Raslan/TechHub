import express from "express";
import db from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import {
    getAllRoadmaps,
    getStepDetails,
    completeStep,
    goToNextStep
} from "../services/roadmaps.service.js"

const router = express.Router();


// Return All Roadmaps
router.get(
    "/roadmaps",
    authMiddleware,
    allowRoles("student", "admin"),
    async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await getAllRoadmaps(userId);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
});

// Get Roadmap details
router.get(
    "/steps/:stepId", 
    authMiddleware, 
    allowRoles("student", "admin"),
    async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = req.params.stepId;

    const data = await getStepDetails(userId, stepId);

    if (!data) {
      return res.status(404).json({ error: "Step not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch step details" });
  }
});

// Mark step as completed
router.post(
    "/steps/:stepId/complete", 
    authMiddleware, 
    allowRoles("student", "admin"),
    async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = req.params.stepId;

    const result = await completeStep(userId, stepId);

    res.json(result);
  } catch (err) {
    if (err.message === "Step not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Step is not in progress") {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to complete step" });
  }
});

// Go to next step
router.get(
    "/steps/:stepId/next", 
    authMiddleware, 
    allowRoles("student", "admin"),
    async (req, res) => {
  try {
    const userId = req.user.id;
    const stepId = req.params.stepId;

    const result = await goToNextStep(userId, stepId);

    res.json(result);
  } catch (err) {
    if (err.message === "Step not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Complete the current step first!") {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to get next step" });
  }
});


export default router;