import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendVerificationEmail(to, code, userId) {
  const subject = "TechHub Email Verification";
  const html = `
    <h2>Welcome to TechHub</h2>
    <p>Your verification code is:</p>
    <h1>${code}</h1>
    <p>This code expires in 5 minutes.</p>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });

  console.log(`Verification email sent to ${to}`);
}
