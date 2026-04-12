import jwt from "jsonwebtoken";
import db from "../db.js";

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ error: "Missing Authorization header" });

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token)
    return res.status(401).json({ error: "Invalid Authorization format" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // دعم الشكل القديم والجديد
    const userId = payload.userId || payload.id;

    req.user = {
      id: userId,
      role: payload.role,
      email: payload.email || null
    };

    // 🔥 check if user is active (NEW)
    const result = await db.query(
      "SELECT is_active FROM users WHERE id=$1",
      [req.user.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(403).json({
        error: "Your account has been suspended",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};