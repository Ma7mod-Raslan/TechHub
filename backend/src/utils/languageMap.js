/**
 * languageMap.js
 *
 * Supported languages and their PTY runner config.
 * cmd  → the shell script node-pty will spawn (lives in /usr/local/bin/)
 * args → arguments passed to the script (none needed, code comes via $SOURCE_B64)
 */

// Judge0 IDs kept for reference
export const languageMap = {
  python:     71,
  javascript: 63,
  cpp:        54,
  java:       62,
};

const ptyConfig = {
  python:     { cmd: "/usr/local/bin/run_python.sh",     args: [] },
  javascript: { cmd: "/usr/local/bin/run_javascript.sh", args: [] },
  cpp:        { cmd: "/usr/local/bin/run_cpp.sh",        args: [] },
  java:       { cmd: "/usr/local/bin/run_java.sh",       args: [] },
};

/**
 * Returns the PTY spawn config for a given language, or null if unsupported.
 * @param {string} language
 * @returns {{ cmd: string, args: string[] } | null}
 */
export const getLanguageConfig = (language) => {
  return ptyConfig[language] ?? null;
};