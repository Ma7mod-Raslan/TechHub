import db from "../db.js";

// Dashboard Stats
export const getDashboardStats = async () => {
  const totalUsersQuery = db.query(`SELECT COUNT(*) FROM users`);
  
  const totalInstructorsQuery = db.query(
    `SELECT COUNT(*) FROM users WHERE role = 'instructor'`
  );

  const activeCoursesQuery = db.query(
    `SELECT COUNT(*) FROM courses WHERE is_active = true`
  );

  const reportsQuery = db.query(
    `SELECT COUNT(*) FROM community_reports`
  );

  // run queries in parallel 🔥
  const [
    totalUsers,
    totalInstructors,
    activeCourses,
    reports
  ] = await Promise.all([
    totalUsersQuery,
    totalInstructorsQuery,
    activeCoursesQuery,
    reportsQuery
  ]);

  return {
    totalUsers: Number(totalUsers.rows[0].count),
    totalInstructors: Number(totalInstructors.rows[0].count),
    activeCourses: Number(activeCourses.rows[0].count),
    reports: Number(reports.rows[0].count)
  };
};

// Instructors data
export const getInstructors = async () => {
  const result = await db.query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      u.is_active,
      COUNT(c.id) AS courses_count
    FROM users u
    LEFT JOIN courses c 
      ON u.id = c.instructor_id
    WHERE u.role = 'instructor'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return result.rows;
};

// Students data
export const getStudents = async () => {
  const result = await db.query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.role,
      u.created_at,
      u.is_active,
      COUNT(e.id) AS enrolled_courses
    FROM users u
    LEFT JOIN enrollments e 
      ON u.id = e.student_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return result.rows;
};

// Toggle Suspend
export const toggleUserStatus = async (userId) => {

    const userResult = await db.query(
    `SELECT id, is_active, role FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = userResult.rows[0];

  // Can't suspend itself
  if (user.role === "admin") {
    throw new Error("Cannot suspend an admin");
  }

  // Toggle
  const newStatus = !user.is_active;

  const updateResult = await db.query(
    `UPDATE users
     SET is_active = $1
     WHERE id = $2
     RETURNING id, full_name, email, role, is_active`,
    [newStatus, userId]
  );

  return updateResult.rows[0];
};
