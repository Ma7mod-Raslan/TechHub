import "dotenv/config";
import db from "../db.js";
import {
  extractVideoId,
  getYoutubeVideoDuration
} from "../utils/youtube.js";

async function backfillDurations() {
  console.log("🔍 Fetching videos without duration...");

  const { rows: videos } = await db.query(`
    SELECT id, video_url
    FROM course_videos
    WHERE duration IS NULL
  `);

  console.log(`📦 Found ${videos.length} videos`);

  for (const video of videos) {
    try {
      const videoId = extractVideoId(video.video_url);

      if (!videoId) {
        console.warn(
          `⚠️ Skipping video ${video.id} (invalid URL)`
        );
        continue;
      }

      const duration = await getYoutubeVideoDuration(videoId);

      await db.query(
        `
        UPDATE course_videos
        SET duration = $1
        WHERE id = $2
        `,
        [duration, video.id]
      );

      console.log(
        `✅ Video ${video.id} updated → ${duration}s`
      );

      // optional: small delay to be extra safe with quota
      await new Promise(res => setTimeout(res, 200));

    } catch (err) {
      console.error(
        `❌ Failed video ${video.id}:`,
        err.message
      );
    }
  }

  console.log("🎉 Backfill completed");
  process.exit(0);
}

backfillDurations();
