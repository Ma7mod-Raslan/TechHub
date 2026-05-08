/**
 * session.manager.js
 *
 * Keeps a registry of all active PTY sessions.
 * Used to:
 *  - Enforce a max concurrent session limit per server restart
 *  - Clean up orphaned sessions on unexpected shutdown
 */

const sessions = new Map(); // pid -> session object

const MAX_CONCURRENT = 50; // tune based on your server capacity

export const sessionManager = {
  /**
   * Register a new session.
   * Throws if the server is already at capacity.
   */
  add(pid, session) {
    if (sessions.size >= MAX_CONCURRENT) {
      session.kill();
      throw new Error("Server is at capacity. Please try again shortly.");
    }
    sessions.set(pid, session);
  },

  /**
   * Remove a session by PID (called on exit or disconnect).
   */
  remove(pid) {
    sessions.delete(pid);
  },

  /**
   * Returns the current number of active sessions.
   */
  count() {
    return sessions.size;
  },

  /**
   * Kill all sessions — used during graceful shutdown.
   */
  killAll() {
    for (const [pid, session] of sessions) {
      try {
        session.kill();
      } catch {
        // already dead, ignore
      }
    }
    sessions.clear();
  },
};

// Graceful shutdown: kill all PTY processes before Node exits
process.on("SIGTERM", () => sessionManager.killAll());
process.on("SIGINT",  () => sessionManager.killAll());