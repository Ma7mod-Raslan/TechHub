import { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings,
  Code2,
  FileText,
  LogOut,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  UserPlus,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';

interface NotificationsProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: string;
}

const notificationsData = [
  {
    id: 1,
    type: 'user',
    title: 'New Instructor Registered',
    message: 'Dr. Michael Chen has registered as an instructor',
    time: '5 minutes ago',
    read: false,
    icon: UserPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 2,
    type: 'support',
    title: 'Support Request Received',
    message: 'New support ticket from john.smith@email.com',
    time: '15 minutes ago',
    read: false,
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: 3,
    type: 'course',
    title: 'New Course Submission',
    message: 'Sarah Johnson submitted "Advanced React Patterns" for review',
    time: '1 hour ago',
    read: false,
    icon: BookOpen,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    id: 4,
    type: 'user',
    title: 'New Student Enrolled',
    message: '25 new students enrolled today',
    time: '2 hours ago',
    read: true,
    icon: Users,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    id: 5,
    type: 'system',
    title: 'System Update Complete',
    message: 'Platform successfully updated to version 2.5.0',
    time: '3 hours ago',
    read: true,
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    id: 6,
    type: 'report',
    title: 'Content Flagged',
    message: 'A post in Web Development community was reported',
    time: '5 hours ago',
    read: true,
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 7,
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'Platform maintenance scheduled for Nov 15, 2024',
    time: '1 day ago',
    read: true,
    icon: Info,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  },
];

export default function AdminNotifications({ navigate, logout }: NotificationsProps) {
  const [notifications, setNotifications] = useState(notificationsData);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'admin-dashboard' },
    { icon: Users, label: 'Users', page: 'admin-users' },
    { icon: BookOpen, label: 'Courses', page: 'admin-courses' },
    { icon: MessageSquare, label: 'Communities', page: 'admin-communities' },
    { icon: FileText, label: 'Reports', page: 'admin-reports' },
    { icon: Bell, label: 'Notifications', page: 'admin-notifications', active: true },
    { icon: User, label: 'Profile', page: 'admin-profile' },
    { icon: Settings, label: 'Settings', page: 'admin-settings' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="admin"
          activePage="admin-notifications"
        />

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Notifications</h1>
                <p className="text-gray-600">System updates and admin alerts</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole="admin" currentPage="admin-notifications" />
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">
                    {unreadCount} Unread
                  </Badge>
                  <Badge variant="outline">
                    {notifications.length} Total
                  </Badge>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark All as Read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className={`${!notification.read ? 'border-l-4 border-l-violet-600' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`${notification.bg} p-3 rounded-lg h-fit`}>
                            <notification.icon className={`h-5 w-5 ${notification.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className={`${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              <div className="flex gap-2">
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 px-2 hover:bg-green-50 hover:text-green-600"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-8 px-2 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl mb-2">No Notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}