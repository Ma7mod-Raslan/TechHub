import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
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
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'instructor';
}

const enrollmentData = [
  { month: 'Jan', students: 120 },
  { month: 'Feb', students: 150 },
  { month: 'Mar', students: 180 },
  { month: 'Apr', students: 220 },
  { month: 'May', students: 280 },
  { month: 'Jun', students: 350 },
];

const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 6100 },
  { month: 'Apr', revenue: 7300 },
  { month: 'May', revenue: 8900 },
  { month: 'Jun', revenue: 10500 },
];

const recentCourses = [
  { title: 'Complete Web Development', students: 1250, progress: 85, rating: 4.9 },
  { title: 'Python for Beginners', students: 980, progress: 92, rating: 4.8 },
  { title: 'React Masterclass', students: 750, progress: 78, rating: 4.7 },
];

export default function InstructorDashboard({ navigate, logout, userRole }: InstructorDashboardProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard', active: true },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
    { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

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
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Dashboard</h1>
                <p className="text-gray-600">Welcome back, Sarah!</p>
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
                    <div className="text-3xl mb-1">12</div>
                    <div className="text-sm text-green-600">+2 this month</div>
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
                    <div className="text-3xl mb-1">2,980</div>
                    <div className="text-sm text-green-600">+350 this month</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Total Revenue</span>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-3xl mb-1">$42.5K</div>
                    <div className="text-sm text-green-600">+15% from last month</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Avg Rating</span>
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl mb-1">4.8</div>
                    <div className="text-sm text-gray-600">From 2,450 reviews</div>
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
                  <Button variant="outline" onClick={() => navigate('instructor-analytics')}>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    View Analytics
                  </Button>
                  <Button variant="outline" onClick={() => navigate('community')}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Enrollment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#0891b2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#0891b2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Courses Performance</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('instructor-courses')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="mb-1">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students} students
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {course.rating}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Course Completion</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-4">
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