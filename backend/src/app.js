import express from "express";
import dotenv from "dotenv";
import coursesRoutes from "./routes/courses.js";

dotenv.config();

const app = express();
app.use(express.json());

// ROUTES
app.use("/api/courses", coursesRoutes);


// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
