import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import coursesRoutes from "./routes/courses.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";

dotenv.config();

console.log("JWT_SECRET =", process.env.JWT_SECRET ? "[SET]" : "[NOT SET]");

const app = express();
app.use(express.json());

// ===== CORS =====
// ضعِ الإعداد قبل تعريف الـ routes
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
  // اذا هتستخدمي httpOnly cookies شغّلي السطرين التالين:
  // credentials: true
}));

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);

// Protected route example
app.use("/api/me", meRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
