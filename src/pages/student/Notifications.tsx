import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
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
  Menu,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface StudentNotificationsProps {
  logout: () => void;
  userRole: 'student';
}

export default function StudentNotifications({ logout, userRole }: StudentNotificationsProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);




  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard' },
    { icon: BookOpen, label: 'Courses', page: '/student/courses' },
    { icon: FileText, label: 'Assignments', page: '/student/assignments' },
    { icon: Award, label: 'Certificates', page: '/student/certificates' },
    { icon: Users, label: 'Community', page: '/student/community' },
    { icon: Map, label: 'Roadmaps', page: '/student/roadmaps' },
    { icon: Code, label: 'Compiler', page: '/student/compiler' },
    { icon: Bell, label: 'Notifications', page: '/student/notifications', active: true },
    { icon: User, label: 'Profile', page: '/student/profile' },
    { icon: Settings, label: 'Settings', page: '/student/settings' },
    { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
  ];

  useEffect(() => {

    const fetchNotifications = async () => {

      try {

        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          "/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        setNotifications(data);

      } catch (error) {
        console.error("Error fetching notifications:", error);
      }

    };

    fetchNotifications();

  }, []);

  const markAsRead = async (id: any) => {

    try {

      const token = localStorage.getItem("accessToken");

      await fetch(
        `/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

    } catch (err) {
      console.error(err);
    }

  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle2;
      case "achievement":
        return Trophy;
      case "message":
        return MessageCircle;
      case "course":
        return BookOpen;
      default:
        return AlertCircle;
    }
  };

  const markAllAsRead = async () => {

    const unread = notifications.filter(n => !n.is_read);

    for (const n of unread) {
      await markAsRead(n.id);
    }

  };



  const handleLogout = () => {
    logout();
    navigate('login');
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "student") {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="student"
          activePage="student-notifications"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Mobile Menu Button */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden flex-shrink-0"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl truncate">Notifications</h1>
                  <p className="text-gray-600 text-sm md:text-base truncate">Stay updated with your learning activity</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                  onClick={markAllAsRead}
                >Mark All as Read</Button>
                <HeaderIcons logout={logout} userRole={userRole} currentPage="notifications" />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 max-w-4xl">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card onClick={() => markAsRead(notification.id)} className={`cursor-pointer transition-all duration-300 ${!notification.is_read ? 'border-l-4 border-l-violet-600 bg-violet-50/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-green-100' :
                          notification.type === 'achievement' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>


                          {(() => {
                            const Icon = getIcon(notification.type);

                            return (
                              <Icon
                                className={`h-6 w-6 ${notification.type === 'success'
                                  ? 'text-green-600'
                                  : notification.type === 'achievement'
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                                  }`}
                              />
                            );
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3>{notification.title}</h3>
                            {!notification.is_read && (
                              <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">New</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <span className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</span>
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