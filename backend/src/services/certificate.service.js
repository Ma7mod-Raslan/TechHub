import pool from "../db.js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import notificationService from "./notification.service.js";
import { createAdminNotification } from "../services/notification.service.js";

const generateCertificate = async (studentId, courseId) => {
  const client = await pool.connect();

  try {

    /* ===============================
       1️⃣ Check if certificate exists
    =============================== */
    const existing = await client.query(
      `SELECT id FROM certificates
       WHERE student_id=$1 AND course_id=$2`,
      [studentId, courseId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    /* ===============================
       2️⃣ Get certificate data
    =============================== */
    const dataRes = await client.query(
      `SELECT
        u.full_name  AS student_name,
        c.title      AS course_title,
        i.full_name  AS instructor_name,
        c.instructor_id
       FROM courses c
       JOIN users i ON c.instructor_id = i.id
       JOIN users u ON u.id = $1
       WHERE c.id = $2`,
      [studentId, courseId]
    );

    const data = dataRes.rows[0];

    if (!data) {
      throw new Error("Course or student not found");
    }

    const { student_name, course_title, instructor_name, instructor_id } = data;

    /* ===============================
       3️⃣ Generate certificate code
    =============================== */
    const year        = new Date().getFullYear();
    const random      = Math.floor(100000 + Math.random() * 900000);
    const certificateCode = `TH-${year}-${random}`;
    const issueDate   = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });

    /* ===============================
       4️⃣ Certificate HTML
    =============================== */
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'Georgia', serif;
            background: #fff;
            width: 297mm;
            min-height: 210mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .certificate {
            width: 270mm;
            min-height: 190mm;
            border: 12px double #b8963e;
            padding: 40px 60px;
            text-align: center;
            position: relative;
            background: #fffdf6;
          }

          .certificate::before {
            content: '';
            position: absolute;
            inset: 8px;
            border: 2px solid #b8963e;
            pointer-events: none;
          }

          .logo {
            font-size: 22px;
            font-weight: bold;
            color: #b8963e;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }

          .divider {
            width: 80px;
            height: 2px;
            background: #b8963e;
            margin: 10px auto;
          }

          .title {
            font-size: 38px;
            color: #1a1a2e;
            font-weight: bold;
            margin: 18px 0 4px;
            letter-spacing: 2px;
          }

          .subtitle {
            font-size: 14px;
            color: #666;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 28px;
          }

          .presented {
            font-size: 15px;
            color: #555;
            margin-bottom: 10px;
          }

          .student-name {
            font-size: 42px;
            color: #b8963e;
            font-style: italic;
            margin: 8px 0 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 16px;
          }

          .body-text {
            font-size: 15px;
            color: #444;
            line-height: 1.8;
            margin-bottom: 8px;
          }

          .course-title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a2e;
            margin: 6px 0 28px;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid #ddd;
          }

          .footer-block {
            text-align: center;
            font-size: 13px;
            color: #555;
          }

          .footer-block .label {
            font-size: 11px;
            color: #999;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .footer-block strong {
            display: block;
            font-size: 14px;
            color: #1a1a2e;
          }

          .cert-id {
            font-size: 11px;
            color: #aaa;
            margin-top: 20px;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">

          <div class="logo">TechHub</div>
          <div class="divider"></div>

          <div class="title">Certificate of Completion</div>
          <div class="subtitle">This is to certify that</div>

          <div class="presented">with great pride, we present this certificate to</div>
          <div class="student-name">${student_name}</div>

          <p class="body-text">for successfully completing the course</p>
          <div class="course-title">${course_title}</div>

          <div class="footer">
            <div class="footer-block">
              <div class="label">Instructor</div>
              <strong>${instructor_name}</strong>
            </div>
            <div class="footer-block">
              <div class="label">Date Issued</div>
              <strong>${issueDate}</strong>
            </div>
            <div class="footer-block">
              <div class="label">Issued by</div>
              <strong>TechHub Platform</strong>
            </div>
          </div>

          <div class="cert-id">Certificate ID: ${certificateCode}</div>

        </div>
      </body>
      </html>
    `;

    /* ===============================
       5️⃣ Ensure certificate folder
    =============================== */
    const certificatesDir = path.join(
      process.cwd(), "src", "uploads", "certificates"
    );

    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    /* ===============================
       6️⃣ Generate PDF
       FIX: --no-sandbox + --disable-setuid-sandbox are required
            when Puppeteer runs as root inside Docker
    =============================== */
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",   // prevents crashes in low-memory containers
        "--disable-gpu",             // not needed in headless mode
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const fileName = `${certificateCode}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      landscape: true,             // certificate looks better in landscape
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    const fileUrl = `/uploads/certificates/${fileName}`;

    /* ===============================
       7️⃣ Save certificate to DB
    =============================== */
    const insert = await client.query(
      `INSERT INTO certificates
         (student_id, course_id, instructor_id, certificate_link, certificate_code)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [studentId, courseId, instructor_id, fileUrl, certificateCode]
    );

    /* ===============================
       8️⃣ Send notifications
    =============================== */
    await notificationService.createNotification(
      studentId,
      "Certificate Ready 🎉",
      `Your certificate for "${course_title}" is now available`,
      "certificate",
      courseId
    );

    await createAdminNotification({
      title: "New Certificate Issued",
      message: `Certificate generated for course "${course_title}"`,
      type: "certificate",
      reference_id: courseId,
    });

    return insert.rows[0];

  } finally {
    client.release();
  }
};

const getStudentCertificates = async (studentId) => {
  const result = await pool.query(
    `SELECT
      cert.id,
      cert.certificate_code,
      cert.certificate_link,
      cert.issued_at,
      c.title AS course_title
     FROM certificates cert
     JOIN courses c ON c.id = cert.course_id
     WHERE cert.student_id = $1
     ORDER BY cert.issued_at DESC`,
    [studentId]
  );

  return result.rows;
};

export default {
  generateCertificate,
  getStudentCertificates,
};