// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { sendVerificationEmail } from "../services/mail.js";

const router = express.Router();
const SALT_ROUNDS = 10;

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // check if user exists
    const exists = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // insert user
    const result = await db.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, full_name, email, role`,
      [full_name, email, hashed]
    );

    const user = result.rows[0];   // ← هنا بيتعرف المتغير user صح

    // generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MIN || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    // save verification data
    await db.query(
      "UPDATE users SET verification_code=$1, verification_expires_at=$2 WHERE id=$3",
      [code, expiresAt, user.id]
    );

    // send email
    sendVerificationEmail(user.email, code, user.id)
      .catch(err => console.error("Email send error:", err));

    res.status(201).json({
      user,
      message: "Account created. Verification code sent to your email."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "email and code required" });

    const result = await db.query(
      "SELECT id, verification_code, verification_expires_at, is_verified FROM users WHERE email=$1",
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    if (user.is_verified) return res.status(200).json({ message: "Already verified" });

    if (!user.verification_code || user.verification_code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    const now = new Date();
    if (user.verification_expires_at && now > user.verification_expires_at) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    await db.query("UPDATE users SET is_verified=true, verification_code=NULL, verification_expires_at=NULL WHERE id=$1", [user.id]);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// resend verification code
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const r = await db.query("SELECT id, is_verified FROM users WHERE email=$1", [email]);
    if (r.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (r.rows[0].is_verified) return res.status(200).json({ message: "Already verified" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = Number(process.env.VERIFICATION_CODE_TTL_MIN || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    await db.query("UPDATE users SET verification_code=$1, verification_expires_at=$2 WHERE id=$3", [code, expiresAt, r.rows[0].id]);

    sendVerificationEmail(email, code, r.rows[0].id).catch(err => console.error("Mail error:", err));
    res.json({ message: "Verification code resent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const result = await db.query(
      "SELECT id, full_name, email, password, role, is_verified FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0]; 

    // check verification
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before login" });
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



export default router;
