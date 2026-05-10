import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./utils/cleanup.js";

// ===== Load environment variables FIRST =====
dotenv.config();

console.log(
  "JWT_SECRET =",
  process.env.JWT_SECRET ? "[SET]" : "[NOT SET]"
);

// ===== __dirname equivalent for ESM =====
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

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
import roadmapsRoutes from "./routes/roadmaps.js";

// ===== Create app =====
const app = express();

// ===== Middlewares =====
app.use(express.json());

// ===== CORS (must be before routes) =====
app.use(cors());

// ===== Static files — absolute path so it works inside Docker =====
// Files are saved to  /app/src/uploads/  by Puppeteer and multer.
// Accessible at       http://localhost/uploads/certificates/file.pdf
//                     (Nginx proxies /uploads/ → backend:5000)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Notifications
app.use("/api/notifications", notificationRoutes);

// Assignments
app.use("/api/assignments", assignmentRoutes);

// Video Progress
app.use("/api", videoProgressRoutes);

// Compiler
app.use("/api/compiler", compilerRoutes);

// Certificates
app.use("/api/certificates", certificateRoutes);

// Instructor routes
app.use("/api/instructor", instructorRoutes);

// Video notes
app.use("/api", videoNotesRoutes);

// User profile
app.use("/api/me", meRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Contact Us
app.use("/api", contactRoutes);

// Roadmaps
app.use("/api", roadmapsRoutes);

// ===== Start server =====
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});