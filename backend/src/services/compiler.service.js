import * as pty from "node-pty";
import { getLanguageConfig } from "../utils/languageMap.js";

const MAX_SESSION_MS = 30_000;
const MAX_IDLE_MS    = 10_000;

export const spawnSession = ({ source_code, language, onData, onExit }) => {
  const config = getLanguageConfig(language);

  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const encoded = Buffer.from(source_code).toString("base64");

  const dockerArgs = [
    "run",
    "--rm",
    "-i",
    "-t",
    "--network", "none",
    "--memory", "128m",
    "--memory-swap", "128m",
    "--cpus", "0.5",
    "--read-only",
    "--tmpfs", "/tmp:size=32m,exec",
    "--env", `SOURCE_B64=${encoded}`,
    "--name", `sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    "techhub-sandbox",
    config.cmd,
  ];

  const ptyProcess = pty.spawn("docker", dockerArgs, {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: "/tmp",
    env: {
      //  Explicit PATH so node-pty can find /usr/local/bin/docker
      PATH: "/usr/local/bin:/usr/bin:/bin",
      TERM: "xterm-color",
    },
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