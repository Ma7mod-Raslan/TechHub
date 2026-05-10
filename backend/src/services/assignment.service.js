import pool from "../db.js";
import certificateService from "./certificate.service.js";
import notificationService from "./notification.service.js";

/* =========================================================
   👨‍🎓 STUDENT — Get all assignments for dashboard
========================================================= */
const getAllAssignmentsForStudentDashboard = async (studentId) => {

  const result = await pool.query(`
    SELECT
      a.id              AS assignment_id,
      a.title           AS assignment_title,
      a.max_attempts,
      c.id              AS course_id,
      c.title           AS course_title,
      e.progress        AS course_progress,

      COUNT(DISTINCT q.id)  AS questions_count,
      COUNT(DISTINCT at.id) AS attempts_used

    FROM enrollments e

    JOIN courses c
      ON c.id = e.course_id

    JOIN assignments a
      ON a.course_id = c.id

    LEFT JOIN assignment_questions q
      ON q.assignment_id = a.id

    LEFT JOIN student_assignment_attempts at
      ON at.assignment_id = a.id
      AND at.student_id = $1

    WHERE e.student_id = $1

    GROUP BY a.id, c.id, e.progress

    ORDER BY c.title ASC, a.created_at ASC
  `, [studentId]);

  return result.rows.map(row => {
    const attemptsUsed = parseInt(row.attempts_used);
    const maxAttempts  = row.max_attempts;           // null = unlimited

    // BUG FIX #1: null max_attempts (unlimited) must evaluate to true, not false
    const attemptsLeft =
      maxAttempts === null
        ? true
        : attemptsUsed < maxAttempts;

    return {
      assignment_id:   row.assignment_id,
      assignment_title: row.assignment_title,
      course_id:       row.course_id,
      course_title:    row.course_title,
      course_progress: parseInt(row.course_progress),
      max_attempts:    maxAttempts,
      attempts_used:   attemptsUsed,
      questions_count: parseInt(row.questions_count),
      // BUG FIX #2: course must be 100% complete AND attempts remaining
      is_unlocked:     parseInt(row.course_progress) >= 100 && attemptsLeft,
    };
  });
};

/* =========================================================
   👨‍🎓 STUDENT — Get assignment details (questions, no answers)
========================================================= */
const getAssignmentDetailsForStudent = async (assignmentId, studentId) => {
  const client = await pool.connect();

  try {
    // BUG FIX #3: check enrollment AND course progress in one query
    const checkRes = await client.query(
      `SELECT a.id, a.max_attempts, e.progress
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN enrollments e ON e.course_id = c.id
       WHERE a.id = $1 AND e.student_id = $2`,
      [assignmentId, studentId]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized");
    }

    const { progress, max_attempts } = checkRes.rows[0];

    // BUG FIX #3: guard access behind progress check
    if (progress < 100) {
      throw new Error("Complete the course before accessing the assignment");
    }

    // BUG FIX #4: guard access if attempts already exhausted
    const attemptsRes = await client.query(
      `SELECT COUNT(*) AS attempts_used
       FROM student_assignment_attempts
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, studentId]
    );

    const attemptsUsed = parseInt(attemptsRes.rows[0].attempts_used);

    if (max_attempts !== null && attemptsUsed >= max_attempts) {
      throw new Error("Max attempts reached");
    }

    // Get assignment basic info
    const assignmentRes = await client.query(
      `SELECT id, title, description, passing_percentage, max_attempts
       FROM assignments
       WHERE id = $1`,
      [assignmentId]
    );

    const assignment = assignmentRes.rows[0];

    // Get questions + options (no is_correct exposed to student)
    const questionsRes = await client.query(
      `SELECT
         q.id   AS question_id,
         q.question_text,
         o.id   AS option_id,
         o.option_text
       FROM assignment_questions q
       LEFT JOIN assignment_options o
         ON q.id = o.question_id
       WHERE q.assignment_id = $1
       ORDER BY q.id`,
      [assignmentId]
    );

    const questionsMap = new Map();

    questionsRes.rows.forEach(row => {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: row.question_id,
          question_text: row.question_text,
          options: []
        });
      }

      if (row.option_id) {
        questionsMap.get(row.question_id).options.push({
          id: row.option_id,
          option_text: row.option_text
        });
      }
    });

    return {
      ...assignment,
      attempts_used: attemptsUsed,
      questions: Array.from(questionsMap.values())
    };

  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🎓 STUDENT — Submit assignment
========================================================= */
const submitAssignment = async (assignmentId, studentId, answers) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!answers || answers.length === 0) {
      throw new Error("No answers submitted");
    }

    /* ===============================
       1️⃣ Get assignment
    =============================== */
    const assignmentRes = await client.query(
      `SELECT course_id, passing_percentage, max_attempts, is_active
       FROM assignments
       WHERE id = $1`,
      [assignmentId]
    );

    if (!assignmentRes.rows.length) {
      throw new Error("Assignment not found");
    }

    const assignment = assignmentRes.rows[0];

    if (!assignment.is_active) {
      throw new Error("Assignment is not active");
    }

    /* ===============================
       2️⃣ Check enrollment + progress
    =============================== */
    const progressRes = await client.query(
      `SELECT progress
       FROM enrollments
       WHERE course_id = $1 AND student_id = $2`,
      [assignment.course_id, studentId]
    );

    if (!progressRes.rows.length) {
      throw new Error("Student not enrolled in this course");
    }

    if (progressRes.rows[0].progress < 100) {
      throw new Error("Complete the course first");
    }

    /* ===============================
       3️⃣ Check attempts
    =============================== */
    const attemptsRes = await client.query(
      `SELECT attempt_number
       FROM student_assignment_attempts
       WHERE assignment_id = $1 AND student_id = $2
       ORDER BY attempt_number DESC
       LIMIT 1`,
      [assignmentId, studentId]
    );

    const lastAttempt  = attemptsRes.rows[0]?.attempt_number || 0;
    const attemptNumber = lastAttempt + 1;

    if (
      assignment.max_attempts !== null &&
      attemptNumber > assignment.max_attempts
    ) {
      throw new Error("Max attempts reached");
    }

    /* ===============================
       4️⃣ Get correct answers
    =============================== */
    const questionsRes = await client.query(
      `SELECT q.id AS question_id, o.id AS correct_option_id
       FROM assignment_questions q
       JOIN assignment_options o
         ON q.id = o.question_id
       WHERE q.assignment_id = $1 AND o.is_correct = true`,
      [assignmentId]
    );

    if (!questionsRes.rows.length) {
      throw new Error("Assignment has no questions");
    }

    const correctMap = new Map(
      questionsRes.rows.map(r => [r.question_id, r.correct_option_id])
    );

    /* ===============================
       5️⃣ Calculate score
    =============================== */
    let score = 0;

    for (const answer of answers) {
      if (!correctMap.has(answer.question_id)) {
        throw new Error("Invalid question submitted");
      }

      if (correctMap.get(answer.question_id) === answer.selected_option_id) {
        score++;
      }
    }

    const totalQuestions = correctMap.size;
    const percentage     = (score / totalQuestions) * 100;
    const isPassed       = percentage >= assignment.passing_percentage;

    /* ===============================
       6️⃣ Insert attempt
    =============================== */
    const attemptInsert = await client.query(
      `INSERT INTO student_assignment_attempts
         (assignment_id, student_id, score, percentage, is_passed, attempt_number)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [assignmentId, studentId, score, percentage, isPassed, attemptNumber]
    );

    const attemptId = attemptInsert.rows[0].id;

    /* ===============================
       7️⃣ Bulk insert answers
    =============================== */
    const values = [];
    const params = [];

    answers.forEach((answer, index) => {
      const base = index * 4;

      params.push(
        attemptId,
        answer.question_id,
        answer.selected_option_id,
        correctMap.get(answer.question_id) === answer.selected_option_id
      );

      values.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4})`);
    });

    await client.query(
      `INSERT INTO student_attempt_answers
         (attempt_id, question_id, selected_option_id, is_correct)
       VALUES ${values.join(",")}`,
      params
    );

    await client.query("COMMIT");

    /* ===============================
       8️⃣ Generate certificate if passed
       — isolated try/catch so a Puppeteer/Chrome crash
         never prevents the submission response
    =============================== */
    let certificate = null;

    if (isPassed) {
      try {
        certificate = await certificateService.generateCertificate(
          studentId,
          assignment.course_id
        );
      } catch (certError) {
        // Log the error but don't fail the submission — the student
        // passed and their attempt is already saved in the DB.
        console.error("⚠️  Certificate generation failed (submission still saved):", certError.message);
      }
    }

    return {
      score,
      totalQuestions,
      percentage,
      is_passed:        isPassed,
      attempt_number:   attemptNumber,
      certificate,
      // lets the frontend know if the cert failed so it can show a fallback msg
      certificate_error: isPassed && certificate === null
        ? "Certificate will be generated shortly. Please check your profile."
        : null
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🎓 STUDENT — Get all attempts for an assignment
========================================================= */
const getStudentAttempts = async (assignmentId, studentId) => {
  const res = await pool.query(
    `SELECT *
     FROM student_assignment_attempts
     WHERE assignment_id = $1 AND student_id = $2
     ORDER BY attempt_number DESC`,
    [assignmentId, studentId]
  );

  return res.rows;
};

/* =========================================================
   👨‍🎓 STUDENT — Get single attempt details (review)
========================================================= */
const getAttemptDetails = async (assignmentId, attemptId, studentId) => {
  const client = await pool.connect();

  try {
    // Get attempt info
    const attemptRes = await client.query(
      `SELECT score, percentage, is_passed, attempt_number
       FROM student_assignment_attempts
       WHERE id = $1
         AND assignment_id = $2
         AND student_id = $3`,
      [attemptId, assignmentId, studentId]
    );

    if (attemptRes.rows.length === 0) {
      throw new Error("Attempt not found");
    }

    const attempt = attemptRes.rows[0];

    // Get questions + options + student answer + correct flag
    const questionsRes = await client.query(
      `SELECT
         q.id              AS question_id,
         q.question_text,
         o.id              AS option_id,
         o.option_text,
         o.is_correct,
         sa.selected_option_id

       FROM assignment_questions q

       LEFT JOIN assignment_options o
         ON o.question_id = q.id

       LEFT JOIN student_attempt_answers sa
         ON sa.question_id = q.id
        AND sa.attempt_id  = $1

       WHERE q.assignment_id = $2

       ORDER BY q.id`,
      [attemptId, assignmentId]
    );

    const questionsMap = new Map();

    questionsRes.rows.forEach(row => {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          question_id:        row.question_id,
          question_text:      row.question_text,
          selected_option_id: row.selected_option_id,
          options: []
        });
      }

      questionsMap.get(row.question_id).options.push({
        id:          row.option_id,
        option_text: row.option_text,
        is_correct:  row.is_correct
      });
    });

    return {
      ...attempt,
      questions: Array.from(questionsMap.values())
    };

  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Create assignment
========================================================= */
const createAssignment = async ({
  course_id,
  title,
  description,
  passing_percentage = 70,
  max_attempts = null,
  instructor_id,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // BUG FIX #5: existence check BEFORE reading courseTitle
    const courseRes = await client.query(
      `SELECT id, title
       FROM courses
       WHERE id = $1 AND instructor_id = $2`,
      [course_id, instructor_id]
    );

    if (courseRes.rows.length === 0) {
      throw new Error("Course not found or not authorized");
    }

    const courseTitle = courseRes.rows[0].title;

    const insertRes = await client.query(
      `INSERT INTO assignments
         (course_id, title, description, passing_percentage, max_attempts)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [course_id, title, description, passing_percentage, max_attempts]
    );

    await client.query("COMMIT");

    // Notify enrolled students about the new assignment
    const students = await pool.query(
      `SELECT student_id FROM enrollments WHERE course_id = $1`,
      [course_id]
    );

    const studentIds = students.rows.map(s => s.student_id);

    if (studentIds.length > 0) {
      await notificationService.createBulkNotifications(
        studentIds,
        "New Assignment Available",
        `A new assignment "${title}" was added to "${courseTitle}"`,
        "assignment",
        insertRes.rows[0].id
      );
    }

    return insertRes.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Add question to assignment
========================================================= */
const addQuestion = async (assignmentId, question_text, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify assignment belongs to instructor
    const assignmentRes = await client.query(
      `SELECT a.id
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.instructor_id = $2`,
      [assignmentId, instructor_id]
    );

    if (assignmentRes.rows.length === 0) {
      throw new Error("Not authorized to modify this assignment");
    }

    const insertRes = await client.query(
      `INSERT INTO assignment_questions (assignment_id, question_text)
       VALUES ($1,$2)
       RETURNING *`,
      [assignmentId, question_text]
    );

    await client.query("COMMIT");

    return insertRes.rows[0];

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Add options to a question
========================================================= */
const addOptions = async (questionId, options, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify question belongs to instructor
    const questionRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c     ON a.course_id     = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (questionRes.rows.length === 0) {
      throw new Error("Not authorized to modify this question");
    }

    // Exactly one correct answer required
    const correctCount = options.filter(o => o.is_correct).length;

    if (correctCount !== 1) {
      throw new Error("There must be exactly one correct option");
    }

    const insertedOptions = [];

    for (const option of options) {
      const res = await client.query(
        `INSERT INTO assignment_options (question_id, option_text, is_correct)
         VALUES ($1,$2,$3)
         RETURNING *`,
        [questionId, option.option_text, option.is_correct]
      );
      insertedOptions.push(res.rows[0]);
    }

    await client.query("COMMIT");

    return insertedOptions;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Update question text and/or options
========================================================= */
const updateQuestion = async (questionId, data, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify ownership
    const checkRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c     ON a.course_id     = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized to edit this question");
    }

    // Update question text
    if (data.question_text) {
      await client.query(
        `UPDATE assignment_questions SET question_text = $1 WHERE id = $2`,
        [data.question_text, questionId]
      );
    }

    // Replace options if provided
    if (data.options && Array.isArray(data.options)) {
      const correctCount = data.options.filter(o => o.is_correct).length;

      if (correctCount !== 1) {
        throw new Error("There must be exactly one correct option");
      }

      // Delete old options then re-insert
      await client.query(
        `DELETE FROM assignment_options WHERE question_id = $1`,
        [questionId]
      );

      for (const option of data.options) {
        await client.query(
          `INSERT INTO assignment_options (question_id, option_text, is_correct)
           VALUES ($1,$2,$3)`,
          [questionId, option.option_text, option.is_correct]
        );
      }
    }

    await client.query("COMMIT");

    return { questionId };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Delete question
========================================================= */
const deleteQuestion = async (questionId, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c     ON a.course_id     = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized to delete this question");
    }

    await client.query(
      `DELETE FROM assignment_questions WHERE id = $1`,
      [questionId]
    );

    await client.query("COMMIT");

    return { questionId };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Get assignment details (with correct answers)
========================================================= */
const getAssignmentDetailsForInstructor = async (assignmentId, instructor_id) => {
  const client = await pool.connect();

  try {
    // Verify ownership
    const assignmentRes = await client.query(
      `SELECT a.*
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.instructor_id = $2`,
      [assignmentId, instructor_id]
    );

    if (assignmentRes.rows.length === 0) {
      throw new Error("Assignment not found or not authorized");
    }

    const assignment = assignmentRes.rows[0];

    // Get questions + options (with is_correct visible to instructor)
    const questionsRes = await client.query(
      `SELECT
         q.id   AS question_id,
         q.question_text,
         o.id   AS option_id,
         o.option_text,
         o.is_correct
       FROM assignment_questions q
       LEFT JOIN assignment_options o
         ON q.id = o.question_id
       WHERE q.assignment_id = $1
       ORDER BY q.id`,
      [assignmentId]
    );

    const questionsMap = new Map();

    questionsRes.rows.forEach(row => {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: row.question_id,
          question_text: row.question_text,
          options: []
        });
      }

      if (row.option_id) {
        questionsMap.get(row.question_id).options.push({
          id:          row.option_id,
          option_text: row.option_text,
          is_correct:  row.is_correct
        });
      }
    });

    return {
      ...assignment,
      questions: Array.from(questionsMap.values())
    };

  } finally {
    client.release();
  }
};

/* =========================================================
   👨‍🏫 INSTRUCTOR — Delete assignment
========================================================= */
const deleteAssignment = async (assignmentId, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkRes = await client.query(
      `SELECT a.id
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1 AND c.instructor_id = $2`,
      [assignmentId, instructor_id]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized to delete this assignment");
    }

    await client.query(`DELETE FROM assignments WHERE id = $1`, [assignmentId]);

    await client.query("COMMIT");

    return { assignmentId };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default {
  getAllAssignmentsForStudentDashboard,
  getAssignmentDetailsForStudent,
  submitAssignment,
  getStudentAttempts,
  getAttemptDetails,
  createAssignment,
  addQuestion,
  addOptions,
  updateQuestion,
  deleteQuestion,
  getAssignmentDetailsForInstructor,
  deleteAssignment,
};