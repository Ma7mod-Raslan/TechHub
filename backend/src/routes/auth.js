// backend/src/routes/auth.js

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { sendVerificationEmail } from "../services/mail.js";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================
//        GOOGLE LOGIN
// =========================
router.post("/google", async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token)
      return res.status(400).json({ error: "Google token is required" });

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const fullName = payload.name;
    const profileImage = payload.picture;

    let userResult = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    // conflict
    if (
      userResult.rows.length > 0 &&
      userResult.rows[0].auth_provider === "local"
    ) {
      return res.status(400).json({
        error: "This email is registered with a password. Please login normally.",
      });
    }

    // create google user
    if (userResult.rows.length === 0) {
      userResult = await db.query(
        `INSERT INTO users (full_name, email, profile_image, role, auth_provider, google_id, is_verified)
         VALUES ($1, $2, $3, 'student', 'google', $4, true)
         RETURNING *`,
        [fullName, email, profileImage, googleId]
      );
    }

    const user = userResult.rows[0];

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// =========================
//        SIGNUP
// =========================
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Validate fields
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate role
    const allowedRoles = ["student", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Role must be either 'student' or 'instructor'",
      });
    }

    // Check if user exists
    const exists = await db.query(
      "SELECT auth_provider FROM users WHERE email=$1",
      [email]
    );

    if (exists.rows.length > 0) {
      if (exists.rows[0].auth_provider === "google") {
        return res.status(400).json({
          error: "This email is registered using Google Sign-In.",
        });
      }
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (full_name, email, password, role, auth_provider)
       VALUES ($1, $2, $3, $4, 'local')
       RETURNING id, full_name, email, role`,
      [full_name, email, hashed, role]
    );

    const user = result.rows[0];

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MIN || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    // Save code
    await db.query(
      "UPDATE users SET verification_code=$1, verification_expires_at=$2 WHERE id=$3",
      [code, expiresAt, user.id]
    );

    // Send email
    sendVerificationEmail(user.email, code, user.id).catch(console.error);

    res.status(201).json({
      user,
      message: "Account created. Verification code sent to your email.",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
//     VERIFY EMAIL
// =========================
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ error: "email and code required" });

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    if (user.auth_provider === "google") {
      return res.status(400).json({
        error: "Google users do not need email verification.",
      });
    }

    if (user.is_verified)
      return res.json({ message: "Already verified" });

    if (user.verification_code !== code)
      return res.status(400).json({ error: "Invalid verification code" });

    if (new Date() > user.verification_expires_at)
      return res.status(400).json({ error: "Verification code expired" });

    await db.query(
      "UPDATE users SET is_verified=true, verification_code=NULL, verification_expires_at=NULL WHERE id=$1",
      [user.id]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
//   RESEND VERIFICATION CODE
// ===============================
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "email required" });

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    if (user.auth_provider === "google") {
      return res.status(400).json({
        error: "Google accounts do not use email verification.",
      });
    }

    if (user.is_verified)
      return res.json({ message: "Already verified" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MIN || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    await db.query(
      "UPDATE users SET verification_code=$1, verification_expires_at=$2 WHERE id=$3",
      [code, expiresAt, user.id]
    );

    sendVerificationEmail(email, code, user.id).catch(console.error);

    res.json({ message: "Verification code resent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =========================
//          LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const result = await db.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    if (user.auth_provider === "google") {
      return res.status(400).json({
        error: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email before login.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
