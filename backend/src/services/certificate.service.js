import pool from "../db.js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import notificationService from "./notification.service.js";
import { createAdminNotification } from "../services/notification.service.js";

/* =========================================================
   Certificate HTML Template
========================================================= */
const buildCertificateHTML = ({ student_name, course_title, instructor_name, certificateCode, issueDate }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 297mm;
      height: 210mm;
      background: #0f0c1a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .cert {
      width: 285mm;
      height: 198mm;
      background: linear-gradient(145deg, #1a1330 0%, #0f0c1a 40%, #1a1330 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 18mm 22mm;
      overflow: hidden;
    }

    .corner {
      position: absolute;
      width: 38mm;
      height: 38mm;
    }
    .corner svg { width: 100%; height: 100%; }
    .corner-tl { top: 6mm;    left: 6mm; }
    .corner-tr { top: 6mm;    right: 6mm;  transform: scaleX(-1); }
    .corner-bl { bottom: 6mm; left: 6mm;   transform: scaleY(-1); }
    .corner-br { bottom: 6mm; right: 6mm;  transform: scale(-1,-1); }

    .border-outer {
      position: absolute;
      inset: 4mm;
      border: 0.4mm solid rgba(212,175,85,0.35);
      pointer-events: none;
    }
    .border-inner {
      position: absolute;
      inset: 6.5mm;
      border: 0.2mm solid rgba(212,175,85,0.18);
      pointer-events: none;
    }

    .bg-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(212,175,85,0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(138,43,226,0.06) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(212,175,85,0.02) 0%, transparent 60%);
      pointer-events: none;
    }

    .brand {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: #d4af55;
      margin-bottom: 3.5mm;
    }

    .divider-top {
      display: flex;
      align-items: center;
      gap: 3mm;
      margin-bottom: 4mm;
      width: 100%;
      justify-content: center;
    }
    .divider-line {
      flex: 1;
      max-width: 45mm;
      height: 0.3mm;
      background: linear-gradient(to right, transparent, rgba(212,175,85,0.5), transparent);
    }
    .divider-diamond {
      width: 2mm;
      height: 2mm;
      background: #d4af55;
      transform: rotate(45deg);
      opacity: 0.7;
    }

    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #f5ecd0;
      letter-spacing: 1px;
      text-align: center;
      margin-bottom: 1.5mm;
      line-height: 1.1;
    }

    .cert-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      font-weight: 300;
      color: rgba(245,236,208,0.55);
      letter-spacing: 4px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 6mm;
    }

    .presented-to {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-weight: 400;
      color: rgba(245,236,208,0.6);
      letter-spacing: 2.5px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 2.5mm;
    }

    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 30pt;
      font-weight: 400;
      font-style: italic;
      color: #d4af55;
      text-align: center;
      margin-bottom: 5mm;
      line-height: 1.15;
    }

    .completion-text {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-weight: 300;
      color: rgba(245,236,208,0.6);
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 2.5mm;
    }

    .course-name {
      font-family: 'Playfair Display', serif;
      font-size: 17pt;
      font-weight: 600;
      color: #f5ecd0;
      text-align: center;
      margin-bottom: 8mm;
      line-height: 1.3;
      max-width: 200mm;
    }

    .divider-mid {
      width: 80mm;
      height: 0.3mm;
      background: linear-gradient(to right, transparent, rgba(212,175,85,0.4), transparent);
      margin-bottom: 7mm;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      padding: 0 5mm;
    }

    .footer-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5mm;
    }

    .footer-label {
      font-family: 'Inter', sans-serif;
      font-size: 6.5pt;
      font-weight: 400;
      color: rgba(245,236,208,0.4);
      letter-spacing: 2.5px;
      text-transform: uppercase;
    }

    .footer-value {
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      font-weight: 500;
      color: rgba(245,236,208,0.85);
      text-align: center;
    }

    .footer-line {
      width: 36mm;
      height: 0.25mm;
      background: rgba(212,175,85,0.35);
      margin-bottom: 1.5mm;
    }

    .cert-id {
      position: absolute;
      bottom: 9.5mm;
      right: 14mm;
      font-family: 'Inter', sans-serif;
      font-size: 6pt;
      font-weight: 400;
      color: rgba(245,236,208,0.25);
      letter-spacing: 1.5px;
    }

    .seal {
      position: absolute;
      bottom: 14mm;
      left: 50%;
      transform: translateX(-50%);
      width: 22mm;
      height: 22mm;
      opacity: 0.65;
    }
    .seal svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="bg-pattern"></div>
    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <div class="corner corner-tl">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 36 M4 4 L36 4" stroke="#d4af55" stroke-width="1.2" opacity="0.7"/>
        <path d="M4 4 L4 76 M4 4 L76 4" stroke="#d4af55" stroke-width="0.4" opacity="0.3"/>
        <circle cx="4" cy="4" r="2.5" fill="#d4af55" opacity="0.8"/>
        <circle cx="36" cy="4" r="1.2" fill="#d4af55" opacity="0.5"/>
        <circle cx="4" cy="36" r="1.2" fill="#d4af55" opacity="0.5"/>
        <path d="M14 4 Q14 14 4 14" stroke="#d4af55" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M24 4 Q24 24 4 24" stroke="#d4af55" stroke-width="0.4" fill="none" opacity="0.25"/>
      </svg>
    </div>
    <div class="corner corner-tr">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 36 M4 4 L36 4" stroke="#d4af55" stroke-width="1.2" opacity="0.7"/>
        <path d="M4 4 L4 76 M4 4 L76 4" stroke="#d4af55" stroke-width="0.4" opacity="0.3"/>
        <circle cx="4" cy="4" r="2.5" fill="#d4af55" opacity="0.8"/>
        <circle cx="36" cy="4" r="1.2" fill="#d4af55" opacity="0.5"/>
        <circle cx="4" cy="36" r="1.2" fill="#d4af55" opacity="0.5"/>
        <path d="M14 4 Q14 14 4 14" stroke="#d4af55" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M24 4 Q24 24 4 24" stroke="#d4af55" stroke-width="0.4" fill="none" opacity="0.25"/>
      </svg>
    </div>
    <div class="corner corner-bl">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 36 M4 4 L36 4" stroke="#d4af55" stroke-width="1.2" opacity="0.7"/>
        <path d="M4 4 L4 76 M4 4 L76 4" stroke="#d4af55" stroke-width="0.4" opacity="0.3"/>
        <circle cx="4" cy="4" r="2.5" fill="#d4af55" opacity="0.8"/>
        <circle cx="36" cy="4" r="1.2" fill="#d4af55" opacity="0.5"/>
        <circle cx="4" cy="36" r="1.2" fill="#d4af55" opacity="0.5"/>
        <path d="M14 4 Q14 14 4 14" stroke="#d4af55" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M24 4 Q24 24 4 24" stroke="#d4af55" stroke-width="0.4" fill="none" opacity="0.25"/>
      </svg>
    </div>
    <div class="corner corner-br">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4 L4 36 M4 4 L36 4" stroke="#d4af55" stroke-width="1.2" opacity="0.7"/>
        <path d="M4 4 L4 76 M4 4 L76 4" stroke="#d4af55" stroke-width="0.4" opacity="0.3"/>
        <circle cx="4" cy="4" r="2.5" fill="#d4af55" opacity="0.8"/>
        <circle cx="36" cy="4" r="1.2" fill="#d4af55" opacity="0.5"/>
        <circle cx="4" cy="36" r="1.2" fill="#d4af55" opacity="0.5"/>
        <path d="M14 4 Q14 14 4 14" stroke="#d4af55" stroke-width="0.5" fill="none" opacity="0.4"/>
        <path d="M24 4 Q24 24 4 24" stroke="#d4af55" stroke-width="0.4" fill="none" opacity="0.25"/>
      </svg>
    </div>

    <div class="seal">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,3 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
          fill="none" stroke="#d4af55" stroke-width="1.5"/>
        <circle cx="50" cy="50" r="22" fill="none" stroke="#d4af55" stroke-width="0.8"/>
        <text x="50" y="46" text-anchor="middle" font-family="Inter,sans-serif"
          font-size="7" font-weight="600" fill="#d4af55" letter-spacing="1">TECH</text>
        <text x="50" y="56" text-anchor="middle" font-family="Inter,sans-serif"
          font-size="7" font-weight="600" fill="#d4af55" letter-spacing="1">HUB</text>
      </svg>
    </div>

    <div class="brand">TechHub</div>

    <div class="divider-top">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line"></div>
    </div>

    <div class="cert-title">Certificate of Completion</div>
    <div class="cert-subtitle">Excellence in Learning</div>

    <div class="presented-to">Proudly Presented To</div>
    <div class="student-name">${student_name}</div>

    <div class="completion-text">For successfully completing</div>
    <div class="course-name">${course_title}</div>

    <div class="divider-mid"></div>

    <div class="footer">
      <div class="footer-col">
        <div class="footer-value">${instructor_name}</div>
        <div class="footer-line"></div>
        <div class="footer-label">Instructor</div>
      </div>
      <div class="footer-col" style="opacity:0">spacer</div>
      <div class="footer-col">
        <div class="footer-value">${issueDate}</div>
        <div class="footer-line"></div>
        <div class="footer-label">Date Issued</div>
      </div>
    </div>

    <div class="cert-id">ID: ${certificateCode}</div>
  </div>
</body>
</html>
`;

/* =========================================================
   Main — generate certificate
========================================================= */
const generateCertificate = async (studentId, courseId) => {
  const client = await pool.connect();

  try {

    /* 1️⃣ Return existing certificate if already issued */
    const existing = await client.query(
      `SELECT id FROM certificates WHERE student_id=$1 AND course_id=$2`,
      [studentId, courseId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    /* 2️⃣ Fetch data */
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
    if (!data) throw new Error("Course or student not found");

    const { student_name, course_title, instructor_name, instructor_id } = data;

    /* 3️⃣ Build metadata */
    const year            = new Date().getFullYear();
    const random          = Math.floor(100000 + Math.random() * 900000);
    const certificateCode = `TH-${year}-${random}`;
    const issueDate       = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    /* 4️⃣ Ensure output folder exists */
    const certificatesDir = path.join(process.cwd(), "src", "uploads", "certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    /* 5️⃣ Launch Puppeteer and generate PDF */
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();

    await page.setContent(
      buildCertificateHTML({ student_name, course_title, instructor_name, certificateCode, issueDate }),
      { waitUntil: "networkidle0" }  // waits for Google Fonts to load
    );

    const fileName = `${certificateCode}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    await page.pdf({
      path:            filePath,
      format:          "A4",
      landscape:       true,
      printBackground: true,          // required for dark background to render
      margin:          { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });

    await browser.close();

    const fileUrl = `../uploads/certificates/${fileName}`;

    /* 6️⃣ Save to database */
    const insert = await client.query(
      `INSERT INTO certificates
         (student_id, course_id, instructor_id, certificate_link, certificate_code)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [studentId, courseId, instructor_id, fileUrl, certificateCode]
    );

    /* 7️⃣ Notify student and admin */
    await notificationService.createNotification(
      studentId,
      "Certificate Ready 🎉",
      `Your certificate for "${course_title}" is ready. Download it from your profile.`,
      "certificate",
      courseId
    );

    await createAdminNotification({
      title:        "New Certificate Issued",
      message:      `Certificate issued for "${course_title}" to student ID ${studentId}`,
      type:         "certificate",
      reference_id: courseId,
    });

    return insert.rows[0];

  } finally {
    client.release();
  }
};

/* =========================================================
   Get all certificates for a student
========================================================= */
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