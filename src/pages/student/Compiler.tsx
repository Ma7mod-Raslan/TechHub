import { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings, Code2, Play, RotateCcw, Save, LogOut, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentCompilerProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

const initialCode = {
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
}`
};

export default function StudentCompiler({ navigate, logout, userRole }: StudentCompilerProps) {
  const [language, setLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [code, setCode] = useState(initialCode.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler', active: true },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput(`Executing ${language} code...\n\nHello, TechHub!\n\nProgram finished with exit code 0`);
      setIsRunning(false);
    }, 1000);
  };

  const handleReset = () => {
    setCode(initialCode[language]);
    setOutput('');
  };

  const handleLanguageChange = (lang: string) => {
    const newLang = lang as 'python' | 'javascript' | 'cpp';
    setLanguage(newLang);
    setCode(initialCode[newLang]);
    setOutput('');
  };

  const handleLogout = () => {
    logout();
    navigate('student-login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-compiler"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Code Compiler</h1>
                <p className="text-gray-600">Practice coding in your browser</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />Reset
                </Button>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />Save
                </Button>
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300" onClick={handleRun} disabled={isRunning}>
                  <Play className="mr-2 h-4 w-4" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
              </div>
            </div>
          </header>

          <main className="p-6 h-[calc(100vh-120px)]">
            <div className="h-full flex flex-col gap-6">
              <Tabs value={language} onValueChange={handleLanguageChange}>
                <TabsList>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="cpp">C++</TabsTrigger>
                </TabsList>

                <TabsContent value={language} className="flex-1 mt-4">
                  <div className="grid grid-rows-2 gap-4 h-full">
                    <Card className="overflow-hidden border-2 border-gray-800 shadow-xl">
                      <CardContent className="p-0 h-full">
                        <div className="bg-[#1E1E1E] text-gray-100 p-4 h-full">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-sm text-gray-400 ml-2">editor.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}</span>
                          </div>
                          <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="h-[calc(100%-40px)] bg-[#1E1E1E] text-gray-100 border-0 font-mono text-sm resize-none focus-visible:ring-0 leading-6"
                            placeholder="Write your code here..."
                            style={{ fontFamily: 'Monaco, Menlo, Consolas, monospace' }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2 border-gray-300 shadow-xl">
                      <CardContent className="p-0 h-full">
                        <div className="bg-gray-900 text-gray-100 p-4 h-full">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                            <div className="text-sm text-cyan-400">▶</div>
                            <span className="text-sm text-gray-300">Console Output</span>
                          </div>
                          <pre className="text-sm font-mono whitespace-pre-wrap text-green-400 leading-6">
                            {output || '// Click "Run Code" to see the output...'}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}