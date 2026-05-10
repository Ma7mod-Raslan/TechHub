// ============================================================
// Compiler.tsx — Interactive Compiler with Xterm.js + WebSocket
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, Square, RotateCcw, Save, ChevronDown } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getStudentMenuItems } from "../student/config/studentMenu";

// ─── Xterm imports ────────────────────────────────────────────
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

// ─── Types ────────────────────────────────────────────────────

type Language = "python" | "javascript" | "cpp" | "java";
type SessionStatus = "idle" | "connecting" | "ready" | "running" | "exited";

interface Props {
  logout: () => void;
  userRole: "student";
}

// ─── Constants ────────────────────────────────────────────────

const INITIAL_CODE: Record<Language, string> = {
  python: `# Python Code Editor\ndef hello_world():\n    print("Hello, TechHub!")\n\nhello_world()`,
  javascript: `// JavaScript Code Editor\nfunction helloWorld() {\n  console.log("Hello, TechHub!");\n}\n\nhelloWorld();`,
  cpp: `// C++ Code Editor\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, TechHub!" << endl;\n  return 0;\n}`,
  java: `// Java Code Editor\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, TechHub!");\n  }\n}`,
};

const FILE_EXTENSIONS: Record<Language, string> = {
  python: "py",
  javascript: "js",
  cpp: "cpp",
  java: "java",
};

const MONACO_LANG: Record<Language, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
  java: "java",
};

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const getWsUrl = () => {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  return `${proto}://${host}/api/compiler/ws`;
};

// ─── Main Component ──────────────────────────────────────────

export default function StudentCompiler({ logout, userRole }: Props) {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(INITIAL_CODE.python);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────
  const terminalDivRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<SessionStatus>("idle");

  // ── Helper: update both ref and state together ────────────────
  const updateStatus = (s: SessionStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  // ── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) {
      navigate("/login", { replace: true });
      return;
    }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });
  }, []);

  // ── Mount Xterm once ─────────────────────────────────────────
  useEffect(() => {
    if (!terminalDivRef.current) return;

    const term = new Terminal({
      theme: {
        background: "#0f1117",
        foreground: "#e2e8f0",
        cursor: "#7c3aed",
        selectionBackground: "#7c3aed44",
        green: "#4ade80",
        red: "#f87171",
        yellow: "#fbbf24",
        cyan: "#22d3ee",
        blue: "#818cf8",
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: "bar",
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalDivRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln("\x1b[1;34m┌─────────────────────────────────────┐\x1b[0m");
    term.writeln("\x1b[1;34m│      TechHub Interactive Terminal     │\x1b[0m");
    term.writeln("\x1b[1;34m└─────────────────────────────────────┘\x1b[0m");
    term.writeln("\x1b[90mClick \x1b[1;32mRun\x1b[0m\x1b[90m to execute your code...\x1b[0m");
    term.writeln("");

    // ✅ statusRef instead of status — always reads the latest value
    term.onData((data) => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        (statusRef.current === "ready" || statusRef.current === "running")
      ) {
        wsRef.current.send(JSON.stringify({ type: "input", data }));
      }
    });

    const ro = new ResizeObserver(() => fitAddon.fit());
    ro.observe(terminalDivRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
    };
  }, []);

  // ── Cleanup WS on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ── Run ──────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!code.trim()) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    termRef.current?.clear();
    termRef.current?.writeln("\x1b[90m▶ Connecting...\x1b[0m");

    updateStatus("connecting");

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "init", language, source_code: code }));
    };

    ws.onmessage = (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "ready":
          updateStatus("running");
          termRef.current?.writeln("\x1b[90m▶ Process started (PID " + msg.pid + ")\x1b[0m\r\n");
          break;

        case "output":
          termRef.current?.write(msg.data);
          break;

        case "exit": {
          updateStatus("exited");
          const exitColor = msg.exitCode === 0 ? "\x1b[32m" : "\x1b[31m";
          termRef.current?.writeln(`\r\n\x1b[90m─────────────────────────────────────\x1b[0m`);
          termRef.current?.writeln(`${exitColor}▶ Process exited with code ${msg.exitCode}\x1b[0m`);
          break;
        }

        case "error":
          updateStatus("exited");
          termRef.current?.writeln(`\r\n\x1b[31m✖ Error: ${msg.data}\x1b[0m`);
          break;
      }
    };

    ws.onerror = () => {
      updateStatus("exited");
      termRef.current?.writeln("\r\n\x1b[31m✖ WebSocket connection failed\x1b[0m");
    };

    // ✅ statusRef.current — no stale closure, no TS error
    ws.onclose = () => {
      updateStatus(statusRef.current !== "exited" ? "idle" : "exited");
    };
  }, [code, language]); // ✅ "status" removed from deps

  // ── Stop ─────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "kill" }));
    }
    wsRef.current?.close();
    wsRef.current = null;
    updateStatus("idle");
    termRef.current?.writeln("\r\n\x1b[33m⚠ Session terminated by user\x1b[0m");
  }, []);

  // ── Reset ─────────────────────────────────────────────────────
  const handleReset = () => {
    handleStop();
    setCode(INITIAL_CODE[language]);
    termRef.current?.clear();
    termRef.current?.writeln("\x1b[90mTerminal cleared. Click Run to start.\x1b[0m");
  };

  // ── Language change ───────────────────────────────────────────
  const handleLanguageChange = (lang: Language) => {
    handleStop();
    setLanguage(lang);
    setCode(INITIAL_CODE[lang]);
    setLangMenuOpen(false);
    termRef.current?.clear();
    termRef.current?.writeln(`\x1b[90mSwitched to ${lang}. Click Run to start.\x1b[0m`);
  };

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!code.trim()) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main.${FILE_EXTENSIONS[language]}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ── Status Badge ──────────────────────────────────────────────
  const statusConfig: Record<SessionStatus, { label: string; color: string }> = {
    idle:       { label: "Idle",       color: "bg-gray-500" },
    connecting: { label: "Connecting", color: "bg-yellow-500 animate-pulse" },
    ready:      { label: "Ready",      color: "bg-blue-500 animate-pulse" },
    running:    { label: "Running",    color: "bg-green-500 animate-pulse" },
    exited:     { label: "Exited",     color: "bg-red-500" },
  };
  const badge = statusConfig[status];
  const isActive = status === "connecting" || status === "ready" || status === "running";

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          menuItems={getStudentMenuItems("/student/compiler")}
          logout={logout}
          userRole="student"
          activePage="student-compiler"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b px-4 md:px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">Code Compiler</h1>
                <p className="text-gray-500 text-sm">Online IDE</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status badge */}
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${badge.color}`} />
                  {badge.label}
                </span>

                {/* Language picker */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLangMenuOpen((v) => !v)}
                    className="flex items-center gap-1"
                  >
                    {LANGUAGES.find((l) => l.value === language)?.label}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-1 z-50 bg-white border rounded-md shadow-lg py-1 min-w-[120px]">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => handleLanguageChange(l.value)}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${
                            language === l.value ? "font-semibold text-violet-600" : ""
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>

                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>

                {isActive ? (
                  <Button
                    size="sm"
                    onClick={handleStop}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Square className="mr-1 h-4 w-4" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleRun}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Run
                  </Button>
                )}

                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
            </div>
          </header>

          {/* Main split: Editor | Terminal */}
          <main className="flex-1 overflow-hidden px-4 md:px-6 pt-4 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">

              {/* ── Monaco Editor ── */}
              <Card className="h-full overflow-hidden border-2 border-gray-800 shadow-xl">
                <CardContent className="p-0 h-full">
                  <div className="bg-[#1E1E1E] text-gray-100 h-full flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                      <span className="text-sm text-gray-400 font-mono">
                        main.{FILE_EXTENSIONS[language]}
                      </span>
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
                        <span className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Editor
                        height="100%"
                        language={MONACO_LANG[language]}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme="vs-dark"
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                          padding: { top: 12 },
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Xterm Terminal ── */}
              <Card className="h-full overflow-hidden border-2 border-gray-700 shadow-xl">
                <CardContent className="p-0 h-full">
                  <div className="bg-[#0f1117] h-full flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
                      <span className="text-sm text-gray-400 font-mono flex items-center gap-2">
                        <span className="text-green-400">$</span>
                        Terminal
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Xterm mounts here */}
                    <div
                      ref={terminalDivRef}
                      className="flex-1 min-h-0 p-2"
                      style={{ overflow: "hidden" }}
                    />
                  </div>
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}