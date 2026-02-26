import pool from "../db.js";

const getAssignmentForCourse = async (courseId, studentId) => {
  const assignmentRes = await pool.query(
    `SELECT * FROM assignments 
     WHERE course_id = $1 AND is_active = true`,
    [courseId]
  );

  if (assignmentRes.rows.length === 0) {
    return null;
  }

  const assignment = assignmentRes.rows[0];

  // Attempts num
  const attemptsRes = await pool.query(
    `SELECT COUNT(*) FROM student_assignment_attempts
     WHERE assignment_id = $1 AND student_id = $2`,
    [assignment.id, studentId]
  );

  const attemptsUsed = parseInt(attemptsRes.rows[0].count);

  // check progress
  const progressRes = await pool.query(
    `SELECT progress_percentage 
     FROM student_courses 
     WHERE course_id = $1 AND student_id = $2`,
    [courseId, studentId]
  );

  const progress = progressRes.rows[0]?.progress_percentage || 0;

  const isUnlocked = progress === 100;

  let canAttempt = true;

  if (assignment.max_attempts !== null) {
    canAttempt = attemptsUsed < assignment.max_attempts;
  }

  if (!isUnlocked) {
    canAttempt = false;
  }

  return {
    ...assignment,
    is_unlocked: isUnlocked,
    attempts_used: attemptsUsed,
    can_attempt: canAttempt,
  };
};

const submitAssignment = async (assignmentId, studentId, answers) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Get assignment + course_id
    const assignmentRes = await client.query(
      `SELECT id, course_id, passing_percentage, max_attempts, is_active
       FROM assignments
       WHERE id = $1`,
      [assignmentId]
    );

    if (assignmentRes.rows.length === 0) {
      throw new Error("Assignment not found");
    }

    const assignment = assignmentRes.rows[0];

    if (!assignment.is_active) {
      throw new Error("Assignment is not active");
    }

    // 2️⃣ Check enrollment + progress
    const progressRes = await client.query(
      `SELECT progress_percentage
       FROM student_courses
       WHERE course_id = $1 AND student_id = $2`,
      [assignment.course_id, studentId]
    );

    if (progressRes.rows.length === 0) {
      throw new Error("Student not enrolled in this course");
    }

    const progress = progressRes.rows[0].progress_percentage;

    if (progress < 100) {
      throw new Error("Complete the course first");
    }

    // 3️⃣ Check attempts count
    const attemptsRes = await client.query(
      `SELECT COUNT(*) FROM student_assignment_attempts
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, studentId]
    );

    const attemptNumber = parseInt(attemptsRes.rows[0].count) + 1;

    if (
      assignment.max_attempts !== null &&
      attemptNumber > assignment.max_attempts
    ) {
      throw new Error("Max attempts reached");
    }

    // 4️⃣ Get correct answers
    const questionsRes = await client.query(
      `SELECT q.id as question_id, o.id as correct_option_id
       FROM assignment_questions q
       JOIN assignment_options o 
       ON q.id = o.question_id
       WHERE q.assignment_id = $1 AND o.is_correct = true`,
      [assignmentId]
    );

    const correctAnswers = questionsRes.rows;

    if (correctAnswers.length === 0) {
      throw new Error("Assignment has no questions");
    }

    // 🔥 PERFORMANCE IMPROVEMENT
    // نحول correct answers لـ Map بدل find كل مرة
    const correctMap = new Map();
    correctAnswers.forEach((row) => {
      correctMap.set(row.question_id, row.correct_option_id);
    });

    let score = 0;

    for (let answer of answers) {
      const correctOption = correctMap.get(answer.question_id);

      if (correctOption && answer.selected_option_id === correctOption) {
        score++;
      }
    }

    const totalQuestions = correctAnswers.length;
    const percentage = (score / totalQuestions) * 100;
    const isPassed = percentage >= assignment.passing_percentage;

    // 5️⃣ Insert attempt
    const attemptInsert = await client.query(
      `INSERT INTO student_assignment_attempts
       (assignment_id, student_id, score, percentage, is_passed, attempt_number)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [
        assignmentId,
        studentId,
        score,
        percentage,
        isPassed,
        attemptNumber,
      ]
    );

    const attemptId = attemptInsert.rows[0].id;

    // 6️⃣ Insert student answers
    for (let answer of answers) {
      const correctOption = correctMap.get(answer.question_id);

      const isCorrect =
        correctOption && answer.selected_option_id === correctOption;

      await client.query(
        `INSERT INTO student_attempt_answers
         (attempt_id, question_id, selected_option_id, is_correct)
         VALUES ($1,$2,$3,$4)`,
        [attemptId, answer.question_id, answer.selected_option_id, isCorrect]
      );
    }

    await client.query("COMMIT");

    return {
      score,
      totalQuestions,
      percentage,
      is_passed: isPassed,
      attempt_number: attemptNumber,
      certificate: isPassed ? "Coming Feature" : null,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getStudentAttempts = async (assignmentId, studentId) => {
  const res = await pool.query(
    `SELECT * FROM student_assignment_attempts
     WHERE assignment_id = $1 AND student_id = $2
     ORDER BY attempt_number DESC`,
    [assignmentId, studentId]
  );

  return res.rows;
};

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

    // Check course exists & belongs to instructor
    const courseRes = await client.query(
      `SELECT id FROM courses
       WHERE id = $1 AND instructor_id = $2`,
      [course_id, instructor_id]
    );

    if (courseRes.rows.length === 0) {
      throw new Error("Course not found or not authorized");
    }

    const insertRes = await client.query(
      `INSERT INTO assignments
       (course_id, title, description, passing_percentage, max_attempts)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        course_id,
        title,
        description,
        passing_percentage,
        max_attempts,
      ]
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

const addQuestion = async (assignmentId, question_text, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check assignment belongs to instructor
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
      `INSERT INTO assignment_questions
       (assignment_id, question_text)
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

const deleteQuestion = async (questionId, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check ownership
    const checkRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized to delete this question");
    }

    await client.query(
      `DELETE FROM assignment_questions
       WHERE id = $1`,
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

const updateQuestion = async (questionId, data, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔐 Check ownership
    const checkRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (checkRes.rows.length === 0) {
      throw new Error("Not authorized to edit this question");
    }

    // ✏️ Update question text
    if (data.question_text) {
      await client.query(
        `UPDATE assignment_questions
         SET question_text = $1
         WHERE id = $2`,
        [data.question_text, questionId]
      );
    }

    // ✏️ Update options (لو بعت options)
    if (data.options && Array.isArray(data.options)) {

      // لازم يكون فيه إجابة صحيحة واحدة بس
      const correctCount = data.options.filter(o => o.is_correct).length;
      if (correctCount !== 1) {
        throw new Error("There must be exactly one correct option");
      }

      // نحذف الاختيارات القديمة
      await client.query(
        `DELETE FROM assignment_options
         WHERE question_id = $1`,
        [questionId]
      );

      // نضيف الاختيارات الجديدة
      for (let option of data.options) {
        await client.query(
          `INSERT INTO assignment_options
           (question_id, option_text, is_correct)
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

const addOptions = async (questionId, options, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check question belongs to instructor
    const questionRes = await client.query(
      `SELECT q.id
       FROM assignment_questions q
       JOIN assignments a ON q.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE q.id = $1 AND c.instructor_id = $2`,
      [questionId, instructor_id]
    );

    if (questionRes.rows.length === 0) {
      throw new Error("Not authorized to modify this question");
    }

    // Ensure exactly one correct answer
    const correctCount = options.filter(o => o.is_correct).length;

    if (correctCount !== 1) {
      throw new Error("There must be exactly one correct option");
    }

    const insertedOptions = [];

    for (let option of options) {
      const res = await client.query(
        `INSERT INTO assignment_options
         (question_id, option_text, is_correct)
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

const getAssignmentDetailsForInstructor = async (
  assignmentId,
  instructor_id
) => {
  const client = await pool.connect();

  try {
    // Check ownership
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

    // Get questions + options
    const questionsRes = await client.query(
      `SELECT 
         q.id as question_id,
         q.question_text,
         o.id as option_id,
         o.option_text,
         o.is_correct
       FROM assignment_questions q
       LEFT JOIN assignment_options o
       ON q.id = o.question_id
       WHERE q.assignment_id = $1
       ORDER BY q.id`,
      [assignmentId]
    );

    // Arrange data properly
    const questionsMap = new Map();

    questionsRes.rows.forEach((row) => {
      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: row.question_id,
          question_text: row.question_text,
          options: [],
        });
      }

      if (row.option_id) {
        questionsMap.get(row.question_id).options.push({
          id: row.option_id,
          option_text: row.option_text,
          is_correct: row.is_correct,
        });
      }
    });

    return {
      ...assignment,
      questions: Array.from(questionsMap.values()),
    };
  } finally {
    client.release();
  }
};

const deleteAssignment = async (assignmentId, instructor_id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check ownership
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

    await client.query(
      `DELETE FROM assignments
       WHERE id = $1`,
      [assignmentId]
    );

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
  getAssignmentForCourse,
  submitAssignment,
  getStudentAttempts,
  createAssignment,
  addQuestion,
  deleteQuestion,
  getAssignmentDetailsForInstructor,
  deleteAssignment,
  updateQuestion,
  addOptions
};