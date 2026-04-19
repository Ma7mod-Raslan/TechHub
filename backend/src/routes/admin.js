import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import {
    getDashboardStats,
    getInstructors,
    getStudents,
    toggleUserStatus,
    getAllCourses,
    toggleCourseStatus,
    deleteCourse,
    getCourseFullDetails,
    getCommunities,
    getCommunityDetails,
    togglePostHide,
    deletePost,
    getReports,
    toggleReportStatus,
    getReportDetails,
    getAdminProfile,
    updateAdminProfile,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getPostReplies,
    deleteReply,
    toggleReplyHide,
    getAllContactMessages,
    getContactMessageDetails,
    replyToContactMessage
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

// Suspend Action For Users
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

// GET Courses data
router.get(
  "/courses",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const courses = await getAllCourses();
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Suspend Action For Course
router.patch(
  "/courses/:id/toggle-status",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const course = await toggleCourseStatus(req.params.id);

      res.json({
        message: `Course ${
          course.is_active ? "activated" : "suspended"
        } successfully`,
        course
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Delete Course by Admin
router.delete(
  "/courses/:id",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const deleted = await deleteCourse(req.params.id);

      res.json({
        message: "Course deleted successfully by Admin",
        course: deleted
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Get full course info
router.get(
  "/courses/:courseId",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await getCourseFullDetails(courseId);

      res.json(course);
    } catch (err) {
      if (err.message === "Course not found") {
        return res.status(404).json({ error: err.message });
      }

      res.status(500).json({ error: err.message });
    }
  }
);

// GET Communities
router.get(
  "/communities",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const communities = await getCommunities();
      res.json(communities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET Specific Community
router.get(
  "/communities/:id",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const community = await getCommunityDetails(req.params.id);
      res.json(community);
    } catch (err) {
      if (err.message === "Community not found") {
        return res.status(404).json({ error: err.message });
      }

      res.status(500).json({ error: err.message });
    }
  }
);

// Toggle hide/unhide for post
router.patch(
  "/posts/:id/toggle-hide",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const post = await togglePostHide(req.params.id, req.user.id);

      res.json({
        message: `Post ${post.is_hidden ? "hidden" : "visible"} successfully`,
        post
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Delete Post (soft delete)
router.delete(
  "/posts/:id",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const post = await deletePost(req.params.id);

      res.json({
        message: "Post deleted successfully",
        post
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET Reports
router.get(
  "/reports",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const reports = await getReports();
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Toggle Action for report
router.patch(
  "/reports/:id/toggle-status",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const updated = await toggleReportStatus(
        req.params.id,
        req.user.id
      );

      res.json({
        message: `Report marked as ${updated.status}`,
        report: updated
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// View Action for report
router.get(
  "/reports/:id",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const report = await getReportDetails(req.params.id);
      res.json(report);
    } catch (err) {
      if (err.message === "Report not found") {
        return res.status(404).json({ error: err.message });
      }

      res.status(500).json({ error: err.message });
    }
  }
);

// GET Admin Info
router.get(
  "/profile",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const profile = await getAdminProfile(req.user.id);
      res.json(profile);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// Update Admin Info
router.patch(
  "/profile",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const updated = await updateAdminProfile(req.user.id, req.body);

      res.json({
        message: "Profile updated successfully",
        profile: updated
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Get Notifications
router.get(
  "/admin/notifications",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  }
);

// Read Notification
router.patch(
  "/notifications/:id/read",
  authMiddleware,
  async (req, res) => {
    const result = await markAsRead(req.params.id, req.user.id);
    res.json(result);
  }
);

// Read All Notifications
router.patch(
  "/notifications/read-all",
  authMiddleware,
  async (req, res) => {
    const result = await markAllAsRead(req.user.id);
    res.json(result);
  }
);


// Delete Specific Notification
router.delete(
  "/notifications/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const result = await deleteNotification(
        req.params.id,
        req.user.id
      );

      res.json(result);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

// Get Replies for post
router.get(
  "/posts/:postId/replies",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const replies = await getPostReplies(req.params.postId);
      res.json(replies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete Reply
router.delete(
  "/replies/:id",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const reply = await deleteReply(req.params.id);

      res.json({
        message: "Reply deleted successfully",
        reply
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Toggle Hide for Reply
router.patch(
  "/replies/:id/toggle-hide",
  authMiddleware,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const reply = await toggleReplyHide(req.params.id);

      res.json({
        message: `Reply ${reply.is_hidden ? "hidden" : "visible"} successfully`,
        reply
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET all
router.get("/contact-messages", authMiddleware, allowRoles("admin"), async (req, res) => {
  const data = await getAllContactMessages();
  res.json(data);
});

// GET details
router.get("/contact-messages/:id", authMiddleware, allowRoles("admin"), async (req, res) => {
  const data = await getContactMessageDetails(req.params.id);
  res.json(data);
});

// POST reply
router.post("/contact-messages/:id/reply", authMiddleware, allowRoles("admin"), async (req, res) => {
  const { reply } = req.body;

  const result = await replyToContactMessage(req.params.id, reply);
  res.json(result);
});

export default router;