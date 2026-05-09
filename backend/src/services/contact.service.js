import db from "../db.js";
import { createAdminNotification } from "./notification.service.js";

const allowedCategories = [
  "General Inquiry",
  "Technical Issue",
  "Billing",
  "Other"
];

export const sendContactMessage = async (data, userId = null) => {
  const { full_name, email, category, message } = data;

  // 🔹 validation
  if (!full_name || !email || !category || !message) {
    throw new Error("All fields are required");
  }

  if (!allowedCategories.includes(category)) {
    throw new Error("Invalid category");
  }

  // 🔹 insert
  const result = await db.query(
    `
    INSERT INTO contact_messages
    (user_id, full_name, email, category, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [userId, full_name, email, category, message]
  );

  const messageId = result.rows[0].id;

  // 🔹 notify admins (non-blocking optional improvement)
  try {
    await createAdminNotification({
      title: "New Contact Message",
      message: `${full_name} sent a message`,
      type: "contact",
      reference_id: messageId
    });
  } catch (err) {
    console.error("Notification failed:", err.message);
  }

  return {
    message: "Message sent successfully",
    id: messageId
  };
};


export const createFeedback = async (data, studentId) => {
  const { stars_num, comment } = data;

  // 🔹 validation
  if (!stars_num || !comment) {
    throw new Error("Stars number and comment are required");
  }

  if (stars_num < 1 || stars_num > 5) {
    throw new Error("Stars number must be between 1 and 5");
  }

  // 🔹 insert
  const result = await db.query(
    `
    INSERT INTO feedback
    (student_id, stars_num, comment)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [studentId, stars_num, comment]
  );

  return {
    message: "Feedback submitted successfully",
    id: result.rows[0].id
  };
};

export const getAllFeedbacks = async () => {
  const result = await db.query(
    `
    SELECT
      f.id,
      f.stars_num,
      f.comment,
      u.full_name AS name,
      'Student' AS role,
      f.created_at
    FROM feedback f
    JOIN users u
      ON f.student_id = u.id
    WHERE f.is_visible = TRUE
    ORDER BY f.stars_num DESC, f.created_at DESC
    `
  );

  return result.rows;
};
