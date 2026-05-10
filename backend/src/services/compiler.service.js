import * as pty from "node-pty";
import { getLanguageConfig } from "../utils/languageMap.js";

const MAX_SESSION_MS = 30_000; // hard lifetime cap — 30 seconds
const MAX_IDLE_MS    = 10_000; // kill after 10s of no output

/**
 * Spawns a throwaway Docker sandbox container for each code execution.
 * The container has:
 *  - no network access        (--network none)
 *  - 128MB RAM cap            (--memory 128m)
 *  - 0.5 CPU cap              (--cpus 0.5)
 *  - read-only filesystem     (--read-only)
 *  - /tmp writable via tmpfs  (--tmpfs /tmp)
 *  - no access to host env or secrets
 *  - auto-removed on exit     (--rm)
 *
 * @param {object}   opts
 * @param {string}   opts.source_code
 * @param {string}   opts.language
 * @param {Function} opts.onData   - called with each output chunk
 * @param {Function} opts.onExit   - called with { exitCode, signal }
 * @returns {{ write: Function, kill: Function, pid: number }}
 */
export const spawnSession = ({ source_code, language, onData, onExit }) => {
  const config = getLanguageConfig(language);

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const encoded = Buffer.from(source_code).toString("base64");

  // ── Docker run args ───────────────────────────────────────────
  const dockerArgs = [
    "run",
    "--rm",                        // delete container on exit
    "-i",                          // keep stdin open (needed for interactive)
    "-t",                          // allocate a pseudo-TTY (needed for xterm)
    "--network", "none",           // no internet access
    "--memory", "128m",            // RAM cap
    "--memory-swap", "128m",       // disable swap
    "--cpus", "0.5",               // CPU cap
    "--read-only",                 // filesystem is read-only
    "--tmpfs", "/tmp:size=32m,exec",    // /tmp is writable (runner scripts need it)
    "--env", `SOURCE_B64=${encoded}`,
    "--name", `sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    "techhub-sandbox",             // the sandbox image
    config.cmd,                    // e.g. run_cpp.sh
  ];

  const ptyProcess = pty.spawn("docker", dockerArgs, {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: "/tmp",
    env: { TERM: "xterm-color" }, // do NOT pass process.env — keeps secrets out
  });

  let idleTimer = null;
  let timedOut  = false;

  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      timedOut = true;
      ptyProcess.kill();
    }, MAX_IDLE_MS);
  };

  // Hard lifetime cap
  const lifetimeTimer = setTimeout(() => {
    timedOut = true;
    ptyProcess.kill();
  }, MAX_SESSION_MS);

  ptyProcess.onData((data) => {
    resetIdle();
    onData(data);
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    clearTimeout(idleTimer);
    clearTimeout(lifetimeTimer);

    if (timedOut) {
      // Show a visible timeout message in the terminal
      onData("\r\n\x1b[33m⚠ Execution timed out (30s limit reached)\x1b[0m\r\n");
    }

    onExit({ exitCode, signal });
  });

  resetIdle();

  return {
    write: (data) => ptyProcess.write(data),
    kill: () => {
      clearTimeout(idleTimer);
      clearTimeout(lifetimeTimer);
      ptyProcess.kill();
    },
    pid: ptyProcess.pid,
  };
};