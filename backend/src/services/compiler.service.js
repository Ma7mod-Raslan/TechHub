import * as pty from "node-pty";
import { getLanguageConfig } from "../utils/languageMap.js";

// Kill session after 30s total life, or 10s of no output
const MAX_SESSION_MS = 30_000;
const MAX_IDLE_MS    = 10_000;

/**
 * Spawns a real PTY process for the given language and source code.
 * Returns a session object the route layer can hold onto.
 *
 * @param {object}   opts
 * @param {string}   opts.source_code
 * @param {string}   opts.language       - e.g. "python", "javascript", "cpp"
 * @param {Function} opts.onData         - called with every output chunk (string)
 * @param {Function} opts.onExit         - called with { exitCode, signal }
 * @returns {{ write: Function, kill: Function, pid: number }}
 */
export const spawnSession = ({ source_code, language, onData, onExit }) => {
  const config = getLanguageConfig(language);

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Pass source code as base64 to avoid shell-escaping issues.
  // The language runner script decodes $SOURCE_B64, writes it to a temp
  // file, then executes it — see /scripts/ in your Docker image.
  const encoded = Buffer.from(source_code).toString("base64");

  const ptyProcess = pty.spawn(config.cmd, config.args, {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: "/tmp",
    env: {
      ...process.env,
      TERM: "xterm-color",
      SOURCE_B64: encoded,
    },
  });

  let idleTimer = null;

  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => ptyProcess.kill(), MAX_IDLE_MS);
  };

  // Hard cap — no session lives longer than MAX_SESSION_MS
  const lifetimeTimer = setTimeout(() => ptyProcess.kill(), MAX_SESSION_MS);

  ptyProcess.onData((data) => {
    resetIdle();
    onData(data);
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    clearTimeout(idleTimer);
    clearTimeout(lifetimeTimer);
    onExit({ exitCode, signal });
  });

  resetIdle();

  return {
    /** Send user keystrokes into the running process */
    write: (data) => ptyProcess.write(data),

    /** Forcefully terminate the session */
    kill: () => {
      clearTimeout(idleTimer);
      clearTimeout(lifetimeTimer);
      ptyProcess.kill();
    },

    pid: ptyProcess.pid,
  };
};