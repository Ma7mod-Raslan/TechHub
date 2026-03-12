import express from "express";
import certificateService from "../services/certificate.service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET my certificates
 */
router.get(
  "/my",
  authMiddleware,
  async (req, res, next) => {
    try {

      if (req.user.role !== "student") {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      const certificates =
        await certificateService.getStudentCertificates(
          req.user.id
        );

      res.json(certificates);

    } catch (error) {
      next(error);
    }
  }
);

export default router;