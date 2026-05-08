// ============================================================
// Compiler.tsx — Student Code Compiler (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Save, Menu } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { runCode } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

type Language = "python" | "javascript" | "cpp";

interface Props {
  logout: () => void;
  userRole: "student";
}

// ─── Constants ───────────────────────────────────────────────

const INITIAL_CODE: Record<Language, string> = {
  python: `# Python Code Editor\ndef hello_world():\n    print("Hello, TechHub!")\n\nhello_world()`,
  javascript: `// JavaScript Code Editor\nfunction helloWorld() {\n  console.log("Hello, TechHub!");\n}\n\nhelloWorld();`,
  cpp: `// C++ Code Editor\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, TechHub!" << endl;\n  return 0;\n}`,
};

const FILE_EXTENSIONS: Record<Language, string> = {
  python: "py",
  javascript: "js",
  cpp: "cpp",
};

// ─── Main Component ──────────────────────────────────────────

export default function StudentCompiler({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(INITIAL_CODE.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });
  }, []);

  const handleRun = async () => {
    if (!code.trim()) { setOutput("⚠️ Please write some code first."); return; }
    setIsRunning(true);
    setOutput("Running...\n");
    try {
      const data: any = await runCode(code, language);
      setOutput(data.output || data.error || "No output.");
    } catch {
      setOutput("❌ Network Error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => { setCode(INITIAL_CODE[language]); setOutput(""); };

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as Language;
    setLanguage(newLang);
    setCode(INITIAL_CODE[newLang]);
    setOutput("");
  };

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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar menuItems={getStudentMenuItems("/student/compiler")} logout={logout} userRole="student" activePage="student-compiler" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl">Code Compiler</h1>
                <p className="text-gray-600 text-sm">Practice coding in your browser</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
                <Button variant="outline" size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save</Button>
                <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-gradient-to-r from-violet-600 to-cyan-500">
                  <Play className="mr-2 h-4 w-4" />{isRunning ? "Running..." : "Run"}
                </Button>
                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 pt-4 pb-0 overflow-hidden flex flex-col">
            <Tabs value={language} onValueChange={handleLanguageChange} className="flex flex-col flex-1 h-full">
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="cpp">C++</TabsTrigger>
              </TabsList>

              <TabsContent value={language} className="flex-1 mt-4 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 160px)" }}>
                  {/* Editor */}
                  <Card className="h-full overflow-hidden border-2 border-gray-800 shadow-xl">
                    <CardContent className="p-0 h-full">
                      <div className="bg-[#1E1E1E] text-gray-100 h-full flex flex-col">
                        <div className="mb-3 pb-2 border-b border-gray-700 px-4 pt-2">
                          <span className="text-sm text-gray-400">editor.{FILE_EXTENSIONS[language]}</span>
                        </div>
                        <Editor
                          height="calc(100% - 40px)"
                          language={language}
                          value={code}
                          onChange={(value) => setCode(value || "")}
                          theme="vs-dark"
                          options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Console */}
                  <Card className="h-full overflow-hidden border-2 border-gray-300 shadow-xl">
                    <CardContent className="p-0 h-full">
                      <div className="bg-gray-900 text-gray-100 p-4 h-full flex flex-col">
                        <div className="mb-3 pb-2 border-b border-gray-700">
                          <span className="text-sm text-gray-300">Console Output</span>
                        </div>
                        <pre className="flex-1 text-sm font-mono whitespace-pre-wrap text-green-400 overflow-auto">
                          {output || '// Click "Run Code" to see the output...'}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}