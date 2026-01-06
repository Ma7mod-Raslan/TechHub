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
import meRoutes from "./routes/me.js";
import videoQuestionsRoutes from "./routes/videoQuestions.js";

// ===== Create app =====
const app = express();

// ===== Middlewares =====
app.use(express.json());

// CORS (must be before routes)
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
    // credentials: true // enable if using cookies
  })
);

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/me", meRoutes);

// Video questions & answers
app.use("/api", videoQuestionsRoutes);

// ===== Start server =====
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
