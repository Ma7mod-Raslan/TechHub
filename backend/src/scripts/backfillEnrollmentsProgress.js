import db from "../db.js";

async function backfillEnrollmentsProgress() {
  try {
    console.log("🚀 Starting backfill enrollments progress...");

    // 1️⃣ Get all enrollments
    const enrollmentsRes = await db.query(`
      SELECT student_id, course_id
      FROM enrollments
    `);

    for (const enrollment of enrollmentsRes.rows) {
      const { student_id, course_id } = enrollment;

      // 2️⃣ Total videos in course
      const totalVideosRes = await db.query(
        `
        SELECT COUNT(*)
        FROM course_videos
        WHERE course_id = $1
        `,
        [course_id]
      );

      const totalVideos = Number(totalVideosRes.rows[0].count);

      if (totalVideos === 0) {
        await db.query(
          `
          UPDATE enrollments
          SET progress = 0, completed = false
          WHERE student_id = $1 AND course_id = $2
          `,
          [student_id, course_id]
        );
        continue;
      }

      // 3️⃣ Completed videos
      const completedVideosRes = await db.query(
        `
        SELECT COUNT(*)
        FROM student_video_progress svp
        JOIN course_videos cv ON cv.id = svp.video_id
        WHERE svp.student_id = $1
          AND svp.is_completed = true
          AND cv.course_id = $2
        `,
        [student_id, course_id]
      );

      const completedVideos = Number(completedVideosRes.rows[0].count);

      // 4️⃣ Calculate progress
      const progress = Math.round((completedVideos / totalVideos) * 100);
      const completed = progress === 100;

      // 5️⃣ Update enrollment
      await db.query(
        `
        UPDATE enrollments
        SET progress = $1, completed = $2
        WHERE student_id = $3 AND course_id = $4
        `,
        [progress, completed, student_id, course_id]
      );

      console.log(
        `✔ Updated enrollment: student=${student_id}, course=${course_id}, progress=${progress}%`
      );
    }

    console.log("✅ Backfill completed successfully");
    process.exit(0);

  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  }
}

backfillEnrollmentsProgress();
