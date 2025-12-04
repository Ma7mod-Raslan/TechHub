import { useState } from 'react';
import { motion } from 'motion/react';
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
  Code2,
  Clock,
  TrendingUp,
  Play,
  CheckCircle2,
  ArrowRight,
  LogOut,
  MessageSquare,
  Menu,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import Sidebar from '../../components/Sidebar';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import TestimonialForm from '../../components/TestimonialForm';

interface StudentDashboardProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

const enrolledCourses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    progress: 65,
    nextLesson: 'React Hooks Advanced',
    image: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjI2MTM4NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: 'Python for Data Science',
    progress: 42,
    nextLesson: 'Pandas DataFrames',
    image: 'https://images.unsplash.com/photo-1762330910399-95caa55acf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZWR1Y2F0aW9uJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYyNzAxOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: 'Machine Learning Fundamentals',
    progress: 28,
    nextLesson: 'Linear Regression',
    image: 'https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc2MjY0NjI5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const recentActivity = [
  { action: 'Completed lesson', title: 'Introduction to React Hooks', time: '2 hours ago', icon: CheckCircle2 },
  { action: 'Submitted assignment', title: 'Build a Todo App', time: '1 day ago', icon: FileText },
  { action: 'Started course', title: 'Machine Learning Fundamentals', time: '3 days ago', icon: Play },
];

export default function StudentDashboard({ navigate, logout, userRole }: StudentDashboardProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard', active: true },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 w-full">
          {/* Header */}
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
                <h1 className="text-xl md:text-2xl">Welcome back, Alex!</h1>
                <p className="text-gray-600 text-sm md:text-base">Continue your learning journey</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Enrolled Courses</span>
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl mb-1">5</div>
                    <div className="text-sm text-gray-600">3 in progress</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Learning Hours</span>
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-3xl mb-1">127</div>
                    <div className="text-sm text-green-600">+12 this week</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Certificates</span>
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-3xl mb-1">2</div>
                    <div className="text-sm text-gray-600">1 pending</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Streak</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-3xl mb-1">14 days</div>
                    <div className="text-sm text-green-600">Keep it up!</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Continue Learning */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Continue Learning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => navigate('course-details')}
                        >
                          <ImageWithFallback
                            src={course.image}
                            alt={course.title}
                            className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">Next: {course.nextLesson}</p>
                            <div className="flex items-center gap-3">
                              <Progress value={course.progress} className="flex-1 h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
                              <span className="text-sm">{course.progress}%</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 w-full sm:w-auto"
                          >
                            Continue
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <activity.icon className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">{activity.action}</div>
                          <div className="text-sm mb-1">{activity.title}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('student-roadmaps')}>
                <CardContent className="pt-6">
                  <Map className="h-12 w-12 text-cyan-600 mb-3" />
                  <h3 className="mb-2">Learning Roadmaps</h3>
                  <p className="text-sm text-gray-600">Explore AI-recommended learning paths</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('student-compiler')}>
                <CardContent className="pt-6">
                  <Code className="h-12 w-12 text-purple-600 mb-3" />
                  <h3 className="mb-2">Code Compiler</h3>
                  <p className="text-sm text-gray-600">Practice coding in your browser</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-200" 
                onClick={() => setIsTestimonialOpen(true)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <h3 className="mb-2 bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Share Your Experience</h3>
                  <p className="text-sm text-gray-600">Help others by sharing your learning journey</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <AIAssistant contextType="dashboard" />
      
      {/* Testimonial Dialog */}
      <Dialog open={isTestimonialOpen} onOpenChange={setIsTestimonialOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <TestimonialForm 
            onClose={() => setIsTestimonialOpen(false)}
            studentName="Alex Johnson"
            studentRole="Software Engineering Student"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}