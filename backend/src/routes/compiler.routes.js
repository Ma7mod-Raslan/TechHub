import express from "express";
import { WebSocketServer } from "ws";
import rateLimit from "express-rate-limit";
import { spawnSession } from "../services/compiler.service.js";
import { languageMap } from "../utils/languageMap.js";
import { authMiddleware } from "../middleware/auth.js";
import { sessionManager } from "../services/session.manager.js";

const router = express.Router();

// Max 10 runs per user per minute
const compilerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please slow down." },
});

// ─────────────────────────────────────────────
//  GET /api/compiler/languages
// ─────────────────────────────────────────────
router.get("/languages", (req, res) => {
  res.json(languageMap);
});

// ─────────────────────────────────────────────
//  GET /api/compiler/ws
//  This route exists ONLY to prevent Express
//  from returning 404 on the WebSocket endpoint.
//  The actual upgrade is handled by attachCompilerWS
//  which intercepts at the HTTP server level BEFORE
//  Express sees the request.
// ─────────────────────────────────────────────
router.get("/ws", (req, res) => {
  res.status(426).json({ error: "This endpoint requires a WebSocket connection." });
});

// ─────────────────────────────────────────────
//  WebSocket upgrade handler
//  Call attachCompilerWS(server) in app.js after
//  app.listen() to wire this up.
// ─────────────────────────────────────────────
export const attachCompilerWS = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    // Only handle our compiler WebSocket path
    // Strip query string if present
    const url = req.url.split("?")[0];
    if (url !== "/api/compiler/ws") return;

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

      // ── init: start a new PTY session ──────────────────
      if (msg.type === "init") {
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

      // ── input: forward keystrokes ───────────────────────
      } else if (msg.type === "input") {
        if (!session) {
          send({ type: "error", data: "No active session" });
          return;
        }
        session.write(msg.data);

      // ── kill: user clicked Stop ─────────────────────────
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