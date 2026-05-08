// ============================================================
// Notifications.tsx — Student Notifications (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BookOpen, Bell, CheckCircle2, Trophy, MessageCircle, AlertCircle, Menu } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface Props { logout: () => void; userRole: "student"; }

// ─── Pure helper ─────────────────────────────────────────────

const getIcon = (type: string) => {
  const map: Record<string, any> = { success: CheckCircle2, achievement: Trophy, message: MessageCircle, course: BookOpen };
  return map[type] ?? AlertCircle;
};

const getIconColor = (type: string) => {
  const map: Record<string, string> = { success: "text-green-600", achievement: "text-yellow-600" };
  return map[type] ?? "text-blue-600";
};

const getIconBg = (type: string) => {
  const map: Record<string, string> = { success: "bg-green-100", achievement: "bg-yellow-100" };
  return map[type] ?? "bg-blue-100";
};

// ─── Main Component ──────────────────────────────────────────

export default function StudentNotifications({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });
    fetchNotifications().then((data: any) => setNotifications(data)).catch(console.error);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) await handleMarkRead(n.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        <Sidebar menuItems={getStudentMenuItems("/student/notifications")} logout={logout} userRole="student" activePage="student-notifications" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl truncate">Notifications</h1>
                  <p className="text-gray-600 text-sm truncate">Stay updated with your learning activity</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleMarkAllRead}>Mark All as Read</Button>
                <HeaderIcons logout={logout} userRole={userRole} currentPage="notifications" />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 max-w-4xl">
            <div className="space-y-3">
              {notifications.map((n) => {
                const Icon = getIcon(n.type);
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
                    <Card onClick={() => handleMarkRead(n.id)} className={`cursor-pointer transition-all duration-300 ${!n.is_read ? "border-l-4 border-l-violet-600 bg-violet-50/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(n.type)}`}>
                            <Icon className={`h-6 w-6 ${getIconColor(n.type)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3>{n.title}</h3>
                              {!n.is_read && <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">New</Badge>}
                            </div>
                            <p className="text-gray-600 mb-2">{n.message}</p>
                            <span className="text-sm text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}