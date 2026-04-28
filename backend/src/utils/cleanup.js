import cron from "node-cron";
import db from "../db.js";

cron.schedule("*/1 * * * *", async () => {
  try {
    await db.query(`
      DELETE FROM users
      WHERE is_verified = false
      AND verification_expires_at < NOW()
    `);

    console.log("🧹 Expired unverified users cleaned");
  } catch (err) {
    console.error("Cleanup error:", err);
  }
});