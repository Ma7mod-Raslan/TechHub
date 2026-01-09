import { motion } from 'motion/react';
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
  Menu,
  Code2,
  Plus,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  LogOut,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface InstructorDashboardProps {
  navigate: (page: string, role?: any, state?: any) => void;
  logout: () => void;
  userRole: 'instructor';
}

export default function InstructorDashboard({ navigate, logout, userRole }: InstructorDashboardProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard', active: true },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    top_courses: [],
  });

  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || "Instructor";
  const firstName = userName.split(" ")[0];




  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/instructor/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="instructor"
          activePage="instructor-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {firstName}!</p>
                </div>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>


          {/* Content */}
          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Courses</span>
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {loading ? "..." : stats.total_courses}
                    </div>
                    <div className="text-sm text-green-600">Nice work</div>


                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Students</span>
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-3xl mb-1">
                      {loading ? "..." : stats.total_students}
                    </div>
                    <div className="text-sm text-green-600">Keep going</div>
                  </CardContent>
                </Card>
              </motion.div>

            </div>

            {/* Quick Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                    onClick={() => navigate('instructor-courses')}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Course
                  </Button>
                  <Button variant="outline" onClick={() => navigate('community')}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Courses by Students */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Courses by Enrollment</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('instructor-courses')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {stats.top_courses.map((course: any, index: number) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="mb-1 font-medium">
                          #{index + 1} {course.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{course.total_students} students enrolled</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(
                            'instructor-course-view',
                            'instructor',
                            { courseId: course.id }
                          )
                        }
                      >
                        <Eye className="h-5 w-5" />
                      </Button>

                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}