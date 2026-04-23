import { motion } from 'motion/react';
import { useState } from 'react';

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
  DollarSign,
  Star,
  TrendingUp,
  UserPlus,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface InstructorNotificationsProps {
  logout: () => void;
  userRole: 'instructor';
}

const notifications = [
  {
    id: 1,
    type: 'revenue',
    icon: DollarSign,
    title: 'New Payment Received',
    message: 'You earned $450 from course enrollments this week.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 2,
    type: 'student',
    icon: UserPlus,
    title: 'New Student Enrollment',
    message: '25 students enrolled in "Complete Web Development Bootcamp" today.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'review',
    icon: Star,
    title: 'New Course Review',
    message: 'John Doe gave your course a 5-star rating with positive feedback!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 4,
    type: 'message',
    icon: MessageSquare,
    title: 'Student Question',
    message: 'Sarah Martinez asked a question in "React Masterclass" discussion.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 5,
    type: 'achievement',
    icon: TrendingUp,
    title: 'Milestone Reached',
    message: 'Congratulations! You now have 3,000 total students across all courses!',
    time: '2 days ago',
    read: true,
  },
];

export default function InstructorNotifications({logout, userRole }: InstructorNotificationsProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/instructor/dashboard' },
    { icon: BookOpen, label: 'My Courses', page: '/instructor/courses' },
    { icon: BarChart3, label: 'Assignments', page: '/instructor/assignments' },
    { icon: Users, label: 'Community', page: '/community' },
    { icon: Bell, label: 'Notifications', page: '/instructor/notifications' },
    { icon: User, label: 'Profile', page: '/instructor/profile' },
    { icon: Settings, label: 'Settings', page: '/instructor/settings' },
    { icon: MessageSquare, label: 'Contact Us', page: '/instructor/contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="instructor"
          activePage="instructor-notifications"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        <div className="flex-1">
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
                  <h1 className="text-2xl">Notifications</h1>
                  <p className="text-gray-600">
                    Stay updated with your teaching activity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">Mark All as Read</Button>

                <HeaderIcons logout={logout} userRole={userRole} currentPage="notifications" />
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
                >
                  <Card className={`cursor-pointer transition-all ${!notification.read ? 'border-l-4 border-l-violet-600 bg-violet-50/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'revenue' ? 'bg-green-100' :
                          notification.type === 'review' ? 'bg-yellow-100' :
                            notification.type === 'achievement' ? 'bg-purple-100' :
                              'bg-blue-100'
                          }`}>
                          <notification.icon className={`h-6 w-6 ${notification.type === 'revenue' ? 'text-green-600' :
                            notification.type === 'review' ? 'text-yellow-600' :
                              notification.type === 'achievement' ? 'text-purple-600' :
                                'text-blue-600'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3>{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="bg-violet-600">New</Badge>
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
