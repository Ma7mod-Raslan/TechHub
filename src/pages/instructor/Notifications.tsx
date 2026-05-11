// ============================================================
// Notifications.tsx — Instructor Notifications (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { DollarSign, Star, TrendingUp, UserPlus, MessageSquare, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead } from "./config/instructorApi";
import { getInstructorMenuItems } from "./config/instructorMenu";

interface Props { logout: () => void; userRole: "instructor"; }

type Notification = { id: number; title: string; message: string; type: string; is_read: boolean; created_at: string; };

// ─── Pure helper ─────────────────────────────────────────────

const getIconAndColor = (type: string) => {
  const map: Record<string, { Icon: any; bg: string; color: string }> = {
    revenue: { Icon: DollarSign, bg: "bg-green-100", color: "text-green-600" },
    review: { Icon: Star, bg: "bg-yellow-100", color: "text-yellow-600" },
    achievement: { Icon: TrendingUp, bg: "bg-purple-100", color: "text-purple-600" },
    student: { Icon: UserPlus, bg: "bg-blue-100", color: "text-blue-600" },
  };
  return map[type] ?? { Icon: MessageSquare, bg: "bg-blue-100", color: "text-blue-600" };
};

// ─── Main Component ──────────────────────────────────────────

export default function InstructorNotifications({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "instructor") navigate(`/${u.role}/dashboard`, { replace: true });

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
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <Sidebar menuItems={getInstructorMenuItems("/instructor/notifications")} logout={logout} userRole="instructor" activePage="instructor-notifications" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 overflow-y-auto">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div><h1 className="text-2xl">Notifications</h1><p className="text-gray-600">Stay updated with your teaching activity</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleMarkAllRead}>Mark All as Read</Button>
                <HeaderIcons logout={logout} userRole={userRole} currentPage="notifications" />
              </div>
            </div>
          </header>

          <main className="p-6 max-w-4xl">
            <div className="space-y-3">
              {notifications.map((n) => {
                const { Icon, bg, color } = getIconAndColor(n.type);
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
                    <Card onClick={() => handleMarkRead(n.id)} className={`cursor-pointer transition-all ${!n.is_read ? "border-l-4 border-l-violet-600 bg-violet-50/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                            <Icon className={`h-6 w-6 ${color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h3>{n.title}</h3>
                              {!n.is_read && <Badge className="bg-violet-600">New</Badge>}
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