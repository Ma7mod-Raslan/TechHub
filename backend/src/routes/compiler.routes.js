import express from "express";
import { WebSocketServer } from "ws";
import rateLimit from "express-rate-limit";
import { spawnSession } from "../services/compiler.service.js";
import { languageMap } from "../utils/languageMap.js";
import { authMiddleware } from "../middleware/auth.js";
import { sessionManager } from "../services/session.manager.js";

const router = express.Router();

// Max 10 runs per user per minute to prevent abuse
const compilerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please slow down." },
});

// ─────────────────────────────────────────────
//  GET /api/compiler/languages
//  Returns supported languages so frontend
//  (Monaco) doesn't need to hardcode anything.
// ─────────────────────────────────────────────
router.get("/languages", (req, res) => {
  res.json(languageMap);
});

// ─────────────────────────────────────────────
//  GET /api/compiler/ws  (WebSocket upgrade)
//
//  Flow:
//   1. Client connects and sends:
//      { type: "init", language: "python", source_code: "..." }
//   2. Server spawns PTY, streams output back as:
//      { type: "output", data: "..." }
//   3. Client sends keystrokes as:
//      { type: "input", data: "\n" }
//   4. On process exit server sends:
//      { type: "exit", exitCode: 0 }
//   5. Either side can close the connection at any time.
// ─────────────────────────────────────────────
export const attachCompilerWS = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  // Upgrade only requests to /api/compiler/ws
  server.on("upgrade", (req, socket, head) => {
    if (req.url !== "/api/compiler/ws") return;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws) => {
    let session = null;

    const send = (obj) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(obj));
      }
    };

    ws.on("message", (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        send({ type: "error", data: "Invalid JSON message" });
        return;
      }

      // ── init: start a new PTY session ──────────────────────────────
      if (msg.type === "init") {
        // Only one session per connection
        if (session) {
          session.kill();
          sessionManager.remove(session.pid);
        }

        const { language, source_code } = msg;

        if (!language || !source_code) {
          send({ type: "error", data: "language and source_code are required" });
          return;
        }

        try {
          session = spawnSession({
            source_code,
            language,
            onData: (data) => send({ type: "output", data }),
            onExit: ({ exitCode, signal }) => {
              send({ type: "exit", exitCode, signal });
              if (session) sessionManager.remove(session.pid);
              session = null;
            },
          });

          sessionManager.add(session.pid, session);
          send({ type: "ready", pid: session.pid });

        } catch (err) {
          send({ type: "error", data: err.message });
        }

      // ── input: forward keystrokes to the running process ───────────
      } else if (msg.type === "input") {
        if (!session) {
          send({ type: "error", data: "No active session" });
          return;
        }
        session.write(msg.data);

      // ── kill: user clicked Stop ─────────────────────────────────────
      } else if (msg.type === "kill") {
        if (session) {
          session.kill();
          sessionManager.remove(session.pid);
          session = null;
        }
      }
    });

    // Clean up on disconnect
    ws.on("close", () => {
      if (session) {
        session.kill();
        sessionManager.remove(session.pid);
        session = null;
      }
    });
  });
};

export default router;