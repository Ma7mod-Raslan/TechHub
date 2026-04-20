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