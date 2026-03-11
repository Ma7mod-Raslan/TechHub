import pool from "../db.js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const generateCertificate = async (studentId, courseId) => {
  const client = await pool.connect();

  try {
    // 1️⃣ Check if certificate already exists
    const existing = await client.query(
      `SELECT id FROM certificates
       WHERE student_id=$1 AND course_id=$2`,
      [studentId, courseId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // 2️⃣ Get student + course + instructor data
    const dataRes = await client.query(
      `SELECT
        u.full_name as student_name,
        c.title as course_title,
        i.full_name as instructor_name,
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

    // 3️⃣ Generate certificate code
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    const certificateCode = `TH-${year}-${random}`;

    const issueDate = new Date().toLocaleDateString();

    // 4️⃣ Generate HTML template
    const html = `
      <html>
      <head>
        <style>
          body{
            font-family: Arial;
            text-align:center;
            padding-top:120px;
          }
          h1{
            font-size:48px;
          }
          h2{
            margin-top:40px;
          }
          .name{
            font-size:40px;
            margin:30px 0;
            font-weight:bold;
          }
          .course{
            font-size:28px;
          }
          .footer{
            margin-top:80px;
            font-size:18px;
          }
        </style>
      </head>

      <body>

        <h1>Certificate of Completion</h1>

        <p>This certifies that</p>

        <div class="name">${student_name}</div>

        <p>has successfully completed the course</p>

        <div class="course">${course_title}</div>

        <h2>Instructor: ${instructor_name}</h2>

        <div class="footer">
          Issued by <b>TeachHub</b><br/>
          Date: ${issueDate}<br/>
          Certificate ID: ${certificateCode}
        </div>

      </body>
      </html>
    `;

    // 5️⃣ Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);

    const fileName = `${certificateCode}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "certificates",
      fileName
    );

    await page.pdf({
      path: filePath,
      format: "A4",
    });

    await browser.close();

    const fileUrl = `/uploads/certificates/${fileName}`;

    // 6️⃣ Save certificate in DB
    const insert = await client.query(
      `INSERT INTO certificates
      (student_id,course_id,instructor_id,certificate_link,certificate_code)
      VALUES($1,$2,$3,$4,$5)
      RETURNING *`,
      [studentId, courseId, instructor_id, fileUrl, certificateCode]
    );

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
      c.title as course_title
     FROM certificates cert
     JOIN courses c ON c.id = cert.course_id
     WHERE cert.student_id=$1
     ORDER BY cert.issued_at DESC`,
    [studentId]
  );

  return result.rows;
};

export default {
  generateCertificate,
  getStudentCertificates,
};