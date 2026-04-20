import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ===== Load environment variables FIRST =====
dotenv.config();

console.log(
  "JWT_SECRET =",
  process.env.JWT_SECRET ? "[SET]" : "[NOT SET]"
);

// ===== Import routes =====
import authRoutes from "./routes/auth.js";
import coursesRoutes from "./routes/courses.js";
import videosRoutes from "./routes/videos.js";
import meRoutes from "./routes/me.js";
import videoNotesRoutes from "./routes/videoNotes.js";
import videoQuestionsRoutes from "./routes/videoQuestions.js";
import videoProgressRoutes from "./routes/videoProgress.js";
import instructorRoutes from "./routes/instructor.js";
import certificateRoutes from "./routes/certificate.routes.js";
import communityRoutes  from "./routes/community.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import adminRoutes  from "./routes/admin.js";
import contactRoutes from "./routes/contact.js";
import compilerRoutes from "./routes/compiler.routes.js";
import notificationRoutes from "./routes/notification.routes.js";


// ===== Create app =====
const app = express();

// ===== Middlewares =====
app.use(express.json());

// ===== CORS (must be before routes) =====
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
    // credentials: true
  })
);

// ===== Routes =====

// Auth
app.use("/api/auth", authRoutes);

// Courses (course CRUD)
app.use("/api/courses", coursesRoutes);

// Videos (add / update / delete / reorder)
app.use("/api/courses", videosRoutes);

// Practice questions (video questions)
app.use("/api", videoQuestionsRoutes);

// Community 
app.use("/api/communities", communityRoutes);

// Notificaations Route
app.use("/api/notifications", notificationRoutes);

// Assignment
app.use("/api/assignments", assignmentRoutes);
// Video Progress
app.use("/api", videoProgressRoutes);

// Compiler Route
app.use("/api/compiler", compilerRoutes);

// Certificate
app.use("/api/certificates", certificateRoutes);
app.use("/uploads", express.static("src/uploads"));

// Instructor routes
app.use("/api/instructor", instructorRoutes);

// Video notes
app.use("/api", videoNotesRoutes);

// User profile
app.use("/api/me", meRoutes);

// Admin Route
app.use("/admin", adminRoutes);

// Contact Us
app.use("/contact", contactRoutes);

// ===== Start server =====
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
