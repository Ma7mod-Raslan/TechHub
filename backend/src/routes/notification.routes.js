import express from "express";
import notificationService from "../services/notification.service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();


/* ===============================
   Get notifications
================================ */
router.get(
  "/",
  authMiddleware,
  async (req,res,next)=>{
    try{

      const notifications =
        await notificationService.getUserNotifications(
          req.user.id
        );

      res.json(notifications);

    }catch(error){
      next(error);
    }
});


/* ===============================
   Unread count
================================ */
router.get(
  "/unread-count",
  authMiddleware,
  async (req,res,next)=>{
    try{

      const count =
        await notificationService.getUnreadCount(
          req.user.id
        );

      res.json({unread:count});

    }catch(error){
      next(error);
    }
});


/* ===============================
   Mark notification as read
================================ */
router.patch(
  "/:id/read",
  authMiddleware,
  async (req,res,next)=>{
    try{

      const result =
        await notificationService.markAsRead(
          req.params.id,
          req.user.id
        );

      res.json(result);

    }catch(error){
      next(error);
    }
});

export default router;