import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Users,
  Code,
  Map,
  Bell,
  User,
  Settings,
  Play,
  RotateCcw,
  Save,
  MessageSquare,
  Menu,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";

type Language = "python" | "javascript" | "cpp";

interface StudentCompilerProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: "student";
}

const initialCode: Record<Language, string> = {
  python: `# Python Code Editor
def hello_world():
    print("Hello, TechHub!")

hello_world()`,

  javascript: `// JavaScript Code Editor
function helloWorld() {
  console.log("Hello, TechHub!");
}

helloWorld();`,

  cpp: `// C++ Code Editor
#include <iostream>
using namespace std;

int main() {
  cout << "Hello, TechHub!" << endl;
  return 0;
}`,
};

export default function StudentCompiler({
  navigate,
  logout,
  userRole,
}: StudentCompilerProps) {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(initialCode.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "student-dashboard" },
    { icon: BookOpen, label: "Courses", page: "student-courses" },
    { icon: FileText, label: "Assignments", page: "student-assignments" },
    { icon: Award, label: "Certificates", page: "student-certificates" },
    { icon: Users, label: "Community", page: "community" },
    { icon: Map, label: "Roadmaps", page: "student-roadmaps" },
    { icon: Code, label: "Compiler", page: "student-compiler", active: true },
    { icon: Bell, label: "Notifications", page: "student-notifications" },
    { icon: User, label: "Profile", page: "student-profile" },
    { icon: Settings, label: "Settings", page: "student-settings" },
    { icon: MessageSquare, label: "Contact Us", page: "student-contact" },
  ];

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("⚠️ Please write some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("Running...\n");

    try {

      const token = localStorage.getItem("accessToken");

      const res = await fetch("${API_URL}/api/compiler/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput(`❌ Error:\n\n${data.error}`);
      } else {
        setOutput(data.output || "Program finished with no output.");
      }
    } catch (err: any) {
      setOutput("Network Error");
    } finally {
      setIsRunning(false);
    }
  };
  const handleReset = () => {
    setCode(initialCode[language]);
    setOutput("");
  };

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as Language;
    setLanguage(newLang);
    setCode(initialCode[newLang]);
    setOutput("");
  };

  const handleSave = () => {
    if (!code.trim()) return;

    const extensions: Record<Language, string> = {
      python: "py",
      javascript: "js",
      cpp: "cpp",
    };

    const fileName = `main.${extensions[language]}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    navigate("login");
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-compiler"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl">Code Compiler</h1>
                <p className="text-gray-600 text-sm">
                  Practice coding in your browser
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>

                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={isRunning}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? "Running..." : "Run"}
                </Button>

                <HeaderIcons
                  navigate={navigate}
                  logout={logout}
                  userRole={userRole}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={language} onValueChange={handleLanguageChange}>
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="cpp">C++</TabsTrigger>
              </TabsList>

              <TabsContent value={language} className="flex-1 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
                  {/* Editor */}
                  <Card className="h-full overflow-hidden border-2 border-gray-800 shadow-xl">
                    <CardContent className="p-0 h-full">
                      <div className="bg-[#1E1E1E] text-gray-100 p-4 h-full flex flex-col">
                        <div className="mb-3 pb-2 border-b border-gray-700">
                          <span className="text-sm text-gray-400">
                            editor.
                            {language === "javascript"
                              ? "js"
                              : language === "python"
                                ? "py"
                                : "cpp"}
                          </span>
                        </div>

                        <Textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="flex-1 bg-[#1E1E1E] text-gray-100 border-0 font-mono text-sm resize-none focus-visible:ring-0"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Console */}
                  <Card className="h-full overflow-hidden border-2 border-gray-300 shadow-xl">
                    <CardContent className="p-0 h-full">
                      <div className="bg-gray-900 text-gray-100 p-4 h-full flex flex-col">
                        <div className="mb-3 pb-2 border-b border-gray-700">
                          <span className="text-sm text-gray-300">
                            Console Output
                          </span>
                        </div>

                        <pre className="flex-1 text-sm font-mono whitespace-pre-wrap text-green-400 overflow-auto">
                          {output ||
                            '// Click "Run Code" to see the output...'}
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