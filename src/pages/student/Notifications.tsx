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
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Trophy,
  AlertCircle,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentNotificationsProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

const notifications = [
  {
    id: 1,
    type: 'success',
    icon: CheckCircle2,
    title: 'Assignment Graded',
    message: 'Your "Build a Todo App" assignment has been graded. You scored 95/100!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    icon: MessageCircle,
    title: 'New Reply',
    message: 'Sarah Johnson replied to your question in "Web Development" community.',
    time: '4 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'achievement',
    icon: Trophy,
    title: 'Achievement Unlocked!',
    message: 'You earned the "Fast Learner" badge for completing 5 courses in a month!',
    time: '1 day ago',
    read: false,
  },
  {
    id: 4,
    type: 'info',
    icon: BookOpen,
    title: 'New Course Available',
    message: 'Check out "Advanced React Patterns" - recommended based on your learning path.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    icon: TrendingUp,
    title: 'Learning Streak',
    message: 'Amazing! You\'re on a 15-day learning streak. Keep it up!',
    time: '3 days ago',
    read: true,
  },
];

export default function StudentNotifications({ navigate, logout, userRole }: StudentNotificationsProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications', active: true },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

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
          activePage="student-notifications"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Notifications</h1>
                <p className="text-gray-600">Stay updated with your learning activity</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">Mark All as Read</Button>
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} currentPage="notifications" />
              </div>
            </div>
          </header>

          <main className="p-6 max-w-4xl">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`cursor-pointer transition-all duration-300 ${!notification.read ? 'border-l-4 border-l-violet-600 bg-violet-50/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'achievement' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <notification.icon className={`h-6 w-6 ${
                            notification.type === 'success' ? 'text-green-600' :
                            notification.type === 'achievement' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3>{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">New</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <span className="text-sm text-gray-500">{notification.time}</span>
                        </div>
                      </div>
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