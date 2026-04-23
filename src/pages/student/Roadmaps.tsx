import { motion } from 'motion/react';
import { useState } from 'react';
import { LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings, Code2, CheckCircle2, Circle, ArrowRight, LogOut, MessageSquare, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface StudentRoadmapsProps {
  logout: () => void;
  userRole: 'student';
}

const roadmaps = [
  {
    id: 1,
    title: 'Full Stack Web Developer',
    description: 'Master frontend and backend development',
    duration: '6-8 months',
    difficulty: 'Intermediate',
    progress: 45,
    steps: [
      { title: 'HTML & CSS Fundamentals', status: 'completed' },
      { title: 'JavaScript Mastery', status: 'completed' },
      { title: 'React Framework', status: 'in-progress' },
      { title: 'Node.js & Express', status: 'locked' },
      { title: 'Database Design', status: 'locked' },
      { title: 'Full Stack Project', status: 'locked' },
    ],
  },
  {
    id: 2,
    title: 'Data Science Professional',
    description: 'Analyze data and build ML models',
    duration: '8-10 months',
    difficulty: 'Advanced',
    progress: 20,
    steps: [
      { title: 'Python Programming', status: 'completed' },
      { title: 'Statistics & Math', status: 'in-progress' },
      { title: 'Data Analysis with Pandas', status: 'locked' },
      { title: 'Machine Learning', status: 'locked' },
      { title: 'Deep Learning', status: 'locked' },
      { title: 'Capstone Project', status: 'locked' },
    ],
  },
  {
    id: 3,
    title: 'Mobile App Developer',
    description: 'Build iOS and Android applications',
    duration: '5-7 months',
    difficulty: 'Intermediate',
    progress: 0,
    steps: [
      { title: 'Mobile UI/UX Basics', status: 'locked' },
      { title: 'React Native', status: 'locked' },
      { title: 'API Integration', status: 'locked' },
      { title: 'App Deployment', status: 'locked' },
    ],
  },
];

export default function StudentRoadmaps({ logout, userRole }: StudentRoadmapsProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard'  },
        { icon: BookOpen, label: 'Courses', page: '/student/courses'  },
        { icon: FileText, label: 'Assignments', page: '/student/assignments' },
        { icon: Award, label: 'Certificates', page: '/student/certificates' },
        { icon: Users, label: 'Community', page: '/community' },
        { icon: Map, label: 'Roadmaps', page: '/student/roadmaps', active: true  },
        { icon: Code, label: 'Compiler', page: '/student/compiler'   },
        { icon: Bell, label: 'Notifications', page: '/student/notifications' },
        { icon: User, label: 'Profile', page: '/student/profile'},
        { icon: Settings, label: 'Settings', page: '/student/settings' },
        { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="student"
          activePage="student-roadmaps"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">Learning Roadmaps</h1>
                <p className="text-gray-600 text-sm md:text-base">AI-powered personalized learning paths</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
              {roadmaps.map((roadmap, index) => (
                <motion.div key={roadmap.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle>{roadmap.title}</CardTitle>
                            <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">{roadmap.difficulty}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{roadmap.description}</p>
                          <p className="text-sm text-gray-500">Estimated time: {roadmap.duration}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl mb-1">{roadmap.progress}%</div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {roadmap.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center gap-4">
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                            ) : step.status === 'in-progress' ? (
                              <div className="h-6 w-6 rounded-full border-4 border-violet-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className={step.status === 'locked' ? 'text-gray-400' : ''}>{step.title}</div>
                            </div>
                            {step.status === 'in-progress' && (
                              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {roadmap.progress === 0 && (
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                          Start Roadmap
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}