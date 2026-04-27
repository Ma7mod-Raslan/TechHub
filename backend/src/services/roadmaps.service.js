import db from "../db.js";

// Get all roadmaps
export const getAllRoadmaps = async (userId) => {
  const query = `
    SELECT 
      r.id,
      r.title,
      r.description,
      r.duration,
      r.difficulty,

      ROUND(
        (COUNT(CASE WHEN urs.status = 'completed' THEN 1 END)::decimal 
        / COUNT(rs.id)) * 100
      ) AS progress,

      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', rs.id,
          'title', rs.title,
          'status', COALESCE(urs.status, 'locked')
        )
        ORDER BY rs.step_order
      ) AS steps

    FROM roadmaps r
    JOIN roadmap_steps rs ON rs.roadmap_id = r.id
    LEFT JOIN user_roadmap_steps urs 
      ON urs.step_id = rs.id AND urs.user_id = $1
    GROUP BY r.id
    ORDER BY r.id;
  `;

  const { rows } = await db.query(query, [userId]);
  return rows;
};

// Start Roadmap
export const startRoadmap = async (userId, roadmapId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. check if already started
    const checkRes = await client.query(
      `SELECT 1
       FROM user_roadmap_steps urs
       JOIN roadmap_steps rs ON rs.id = urs.step_id
       WHERE urs.user_id = $1 AND rs.roadmap_id = $2
       LIMIT 1`,
      [userId, roadmapId]
    );

    // 2. if not started → initialize
    if (checkRes.rowCount === 0) {
      await client.query(
        `INSERT INTO user_roadmap_steps (user_id, step_id, status)
         SELECT 
           $1,
           rs.id,
           CASE 
             WHEN rs.step_order = 1 THEN 'in-progress'
             ELSE 'locked'
           END
         FROM roadmap_steps rs
         WHERE rs.roadmap_id = $2`,
        [userId, roadmapId]
      );
    }

    // 3. get current step
    const currentStepRes = await client.query(
      `SELECT rs.id
       FROM user_roadmap_steps urs
       JOIN roadmap_steps rs ON rs.id = urs.step_id
       WHERE urs.user_id = $1 
       AND rs.roadmap_id = $2
       AND urs.status = 'in-progress'
       LIMIT 1`,
      [userId, roadmapId]
    );

    await client.query("COMMIT");

    return {
      started: true,
      currentStepId: currentStepRes.rows[0]?.id || null
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get Step Details 
export const getStepDetails = async (userId, stepId) => {
  const query = `
    SELECT 
    r.id,
    r.title,
    r.description,
    r.duration,
    r.difficulty,

    -- progress subquery
    prog.progress,

    -- step 
    JSON_BUILD_OBJECT(
        'id', rs.id,
        'title', rs.title,
        'description', rs.description,
        'estimated_time', rs.estimated_time,
        'step_order', rs.step_order,
        'status', COALESCE(urs.status, 'locked'),
        'learningObjectives', COALESCE((
        SELECT JSON_AGG(slo.objective)
        FROM step_learning_objectives slo
        WHERE slo.step_id = rs.id
        ), '[]'::json)
    ) AS step

    FROM roadmap_steps rs

    JOIN roadmaps r 
    ON r.id = rs.roadmap_id

    -- status بتاع step الحالي
    LEFT JOIN user_roadmap_steps urs 
    ON urs.step_id = rs.id 
    AND urs.user_id = $1

    -- subquery لحساب progress
    JOIN (
    SELECT 
        rs2.roadmap_id,
        ROUND(
        (COUNT(CASE WHEN urs2.status = 'completed' THEN 1 END)::decimal 
        / COUNT(rs2.id)) * 100
        ) AS progress
    FROM roadmap_steps rs2
    LEFT JOIN user_roadmap_steps urs2 
        ON urs2.step_id = rs2.id AND urs2.user_id = $1
    GROUP BY rs2.roadmap_id
    ) prog 
    ON prog.roadmap_id = r.id

    WHERE rs.id = $2;
  `;

  const { rows } = await db.query(query, [userId, stepId]);
  return rows[0];
};

// Mark step as completed
export const completeStep = async (userId, stepId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. get step info
    const stepRes = await client.query(
      `SELECT roadmap_id, step_order 
       FROM roadmap_steps 
       WHERE id = $1`,
      [stepId]
    );

    if (stepRes.rowCount === 0) {
      throw new Error("Step not found");
    }

    const { roadmap_id, step_order } = stepRes.rows[0];

    // 2. check status
    const statusRes = await client.query(
      `SELECT status 
       FROM user_roadmap_steps 
       WHERE user_id = $1 AND step_id = $2`,
      [userId, stepId]
    );

    if (
      statusRes.rowCount === 0 ||
      statusRes.rows[0].status !== "in-progress"
    ) {
      throw new Error("Step is not in progress");
    }

    // 3. mark completed
    await client.query(
      `UPDATE user_roadmap_steps
       SET status = 'completed', completed_at = NOW()
       WHERE user_id = $1 AND step_id = $2`,
      [userId, stepId]
    );

    // 4. unlock next step
    await client.query(
      `UPDATE user_roadmap_steps
       SET status = 'in-progress'
       WHERE user_id = $1
       AND step_id = (
         SELECT id FROM roadmap_steps
         WHERE roadmap_id = $2 AND step_order = $3 + 1
       )`,
      [userId, roadmap_id, step_order]
    );

    // 5. calculate progress
    const progressRes = await client.query(
      `SELECT 
        ROUND(
          (COUNT(CASE WHEN urs.status = 'completed' THEN 1 END)::decimal 
          / COUNT(rs.id)) * 100
        ) AS progress
       FROM roadmap_steps rs
       LEFT JOIN user_roadmap_steps urs 
         ON urs.step_id = rs.id AND urs.user_id = $1
       WHERE rs.roadmap_id = $2`,
      [userId, roadmap_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      progress: progressRes.rows[0].progress,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Go to next step action
export const goToNextStep = async (userId, stepId) => {
  // 1. get current step info
  const stepRes = await db.query(
    `SELECT rs.roadmap_id, rs.step_order, urs.status
     FROM roadmap_steps rs
     LEFT JOIN user_roadmap_steps urs 
       ON urs.step_id = rs.id AND urs.user_id = $1
     WHERE rs.id = $2`,
    [userId, stepId]
  );

  if (stepRes.rowCount === 0) {
    throw new Error("Step not found");
  }

  const { roadmap_id, step_order, status } = stepRes.rows[0];

  // 2. check if completed
  if (status !== "completed") {
    throw new Error("Complete the current step first!");
  }

  // 3. get next step
  const nextRes = await db.query(
    `SELECT id
     FROM roadmap_steps
     WHERE roadmap_id = $1 AND step_order = $2 + 1`,
    [roadmap_id, step_order]
  );

  if (nextRes.rowCount === 0) {
    return {
      message: "You have completed the roadmap 🎉",
      nextStepId: null,
    };
  }

  return {
    nextStepId: nextRes.rows[0].id,
  };
};