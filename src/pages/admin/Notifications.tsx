import { useEffect, useState } from 'react';
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

const getIcon = (type: string) => {
  switch (type) {
    case "contact": return AlertCircle;
    case "user": return UserPlus;
    case "course": return BookOpen;
    default: return Bell;
  }
};

export default function AdminNotifications({ navigate, logout }: NotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);

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





  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );

    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:5000/notifications/read-all", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );

    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      setNotifications(prev => prev.filter(n => n.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const data = await res.json();

      setNotifications(
        data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.created_at).toLocaleString(),
          read: n.is_read,
          type: n.type,
          icon: Bell, // ممكن تطوريها بعدين حسب النوع
          color: "text-blue-600",
          bg: "bg-blue-50"
        }))
      );

    } catch (err) {
      console.error(err);
    }
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
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                    >
                      <Card className={`${!notification.read ? 'border-l-4 border-l-violet-600' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">

                            {/* Icon */}
                            <div className={`${notification.bg} p-3 rounded-lg h-fit`}>
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>

                            {/* Content */}
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

                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>

                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
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