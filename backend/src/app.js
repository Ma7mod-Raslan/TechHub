import express from "express";
import dotenv from "dotenv";
import coursesRoutes from "./routes/courses.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";

dotenv.config();

console.log("JWT_SECRET =", process.env.JWT_SECRET ? "[SET]" : "[NOT SET]");

const app = express();
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);

// Protected route example
app.use("/api/me", meRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
