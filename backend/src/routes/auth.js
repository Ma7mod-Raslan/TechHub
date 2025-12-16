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
  const client = await db.connect();

  try {
    const {
      full_name,
      email,
      password,
      role,
      job_title,
      linkedin,
      expertise,
    } = req.body;

    // 1️⃣ Validate common fields
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2️⃣ Validate role
    const allowedRoles = ["student", "instructor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Role must be either 'student' or 'instructor'",
      });
    }

    // 3️⃣ Instructor extra validation
    if (role === "instructor") {
      if (!job_title || !expertise) {
        return res.status(400).json({
          error: "Instructor must provide job_title and expertise",
        });
      }
    }

    await client.query("BEGIN");

    // 4️⃣ Check if user exists
    const exists = await client.query(
      "SELECT auth_provider FROM users WHERE email=$1",
      [email]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");

      if (exists.rows[0].auth_provider === "google") {
        return res.status(400).json({
          error: "This email is registered using Google Sign-In.",
        });
      }

      return res.status(409).json({ error: "Email already registered" });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create user
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password, role, auth_provider)
       VALUES ($1, $2, $3, $4, 'local')
       RETURNING id, full_name, email, role`,
      [full_name, email, hashedPassword, role]
    );

    const user = userResult.rows[0];

    // 7️⃣ Create instructor profile if needed
    if (role === "instructor") {
      await client.query(
        `INSERT INTO instructor_profiles (user_id, job_title, linkedin, expertise)
         VALUES ($1, $2, $3, $4)`,
        [user.id, job_title, linkedin || null, expertise]
      );
    }

    // 8️⃣ Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MIN || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    await client.query(
      `UPDATE users
       SET verification_code=$1, verification_expires_at=$2
       WHERE id=$3`,
      [code, expiresAt, user.id]
    );

    await client.query("COMMIT");

    // 9️⃣ Send email async
    sendVerificationEmail(user.email, code, user.id).catch(console.error);

    res.status(201).json({
      user,
      message: "Account created. Verification code sent to your email.",
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  } finally {
    client.release();
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

// =========================
//          Forget Password
// =========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email is required" });

    const result = await db.query(
      "SELECT id, auth_provider FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    if (user.auth_provider === "google") {
      return res.status(400).json({
        error: "Google accounts do not use passwords. Please sign in with Google."
      });
    }

    // Generate new reset code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000); // 15 minutes

    await db.query(
      `UPDATE users SET verification_code=$1, verification_expires_at=$2 WHERE id=$3`,
      [code, expires, user.id]
    );

    sendVerificationEmail(email, code, user.id);

    res.json({ message: "Reset code sent to your email." });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================
// verify reset code
// =========================
router.post("/verify-reset", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ error: "Email and code are required" });

    const result = await db.query(
      `SELECT id, verification_code, verification_expires_at 
       FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    if (user.verification_code !== code)
      return res.status(400).json({ error: "Invalid code" });

    if (new Date() > user.verification_expires_at)
      return res.status(400).json({ error: "Code expired" });

    res.json({ message: "Code verified successfully" });

  } catch (err) {
    console.error("Verify Reset Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// =========================
//        RESET PASSWORD
// =========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password)
      return res.status(400).json({
        error: "Email, code, and new password are required"
      });

    const result = await db.query(
      `SELECT id, verification_code, verification_expires_at 
       FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    // Validate code
    if (user.verification_code !== code)
      return res.status(400).json({ error: "Invalid code" });

    if (new Date() > user.verification_expires_at)
      return res.status(400).json({ error: "Code expired" });

    // Update password
    const hashed = await bcrypt.hash(new_password, 10);

    await db.query(
      `UPDATE users 
       SET password=$1, verification_code=NULL, verification_expires_at=NULL 
       WHERE id=$2`,
      [hashed, user.id]
    );

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: err.message });
  }
});




export default router;
