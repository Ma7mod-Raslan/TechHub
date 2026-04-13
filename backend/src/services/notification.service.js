import pool from "../db.js";

/* ===============================
   Create single notification
================================ */
const createNotification = async (
  userId,
  title,
  message,
  type,
  referenceId = null
) => {

  const result = await pool.query(
    `INSERT INTO notifications
     (user_id, title, message, type, reference_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [userId, title, message, type, referenceId]
  );

  return result.rows[0];
};


/* ===============================
   Bulk notifications (for courses)
================================ */
const createBulkNotifications = async (
  userIds,
  title,
  message,
  type,
  referenceId = null
) => {

  if (!userIds.length) return;

  const values = [];
  const params = [];

  userIds.forEach((userId, index) => {
    const base = index * 5;

    params.push(
      userId,
      title,
      message,
      type,
      referenceId
    );

    values.push(
      `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5})`
    );
  });

  const query = `
    INSERT INTO notifications
    (user_id,title,message,type,reference_id)
    VALUES ${values.join(",")}
  `;

  await pool.query(query, params);
};


/* ===============================
   Get user notifications
================================ */
const getUserNotifications = async (userId) => {

  const result = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id=$1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  return result.rows;
};


/* ===============================
   Unread count
================================ */
const getUnreadCount = async (userId) => {

  const result = await pool.query(
    `SELECT COUNT(*) 
     FROM notifications
     WHERE user_id=$1
     AND is_read=false`,
    [userId]
  );

  return result.rows[0].count;
};


/* ===============================
   Mark as read
================================ */
const markAsRead = async (notificationId,userId) => {

  const result = await pool.query(
    `UPDATE notifications
     SET is_read=true
     WHERE id=$1
     AND user_id=$2
     RETURNING *`,
    [notificationId,userId]
  );

  return result.rows[0];
};

// Admin Notifications
export const createAdminNotification = async ({
  title,
  message,
  type,
  reference_id = null
}) => {
  const admins = await db.query(
    `SELECT id FROM users WHERE role = 'admin'`
  );

  if (admins.rows.length === 0) return;

  const values = admins.rows
    .map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`)
    .join(",");

  const params = [];

  admins.rows.forEach(admin => {
    params.push(
      admin.id,
      title,
      message,
      type,
      reference_id
    );
  });

  await db.query(
    `
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES ${values}
    `,
    params
  );
};

export default {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead
};