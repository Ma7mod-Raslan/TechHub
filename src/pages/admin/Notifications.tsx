// ============================================================
// Notifications.tsx — Admin Notifications (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, BookOpen, UserPlus, AlertCircle, Menu } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import {
  fetchNotifications as apiFetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as apiDeleteNotification,
} from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";
import { notifyUpdate } from "../../utils/notifications";

interface AdminNotificationsProps {
  logout: () => void;
  userRole: string;
}

// ─── Pure helper ─────────────────────────────────────────────

const getIcon = (type: string) => {
  const iconMap: Record<string, React.ElementType> = {
    contact: AlertCircle,
    user: UserPlus,
    course: BookOpen,
  };
  return iconMap[type] ?? Bell;
};

// ─── Main Component ──────────────────────────────────────────

export default function AdminNotifications({ logout }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    apiFetchNotifications()
      .then((data: any) =>
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleString(),
            read: n.is_read,
            type: n.type,
            bg: "bg-blue-50",
          }))
        )
      )
      .catch(console.error);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      notifyUpdate();
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      notifyUpdate();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/notifications")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Notifications</h1>
                <p className="text-gray-600">System updates and admin alerts</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-notifications" />
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">{unreadCount} Unread</Badge>
                  <Badge variant="outline">{notifications.length} Total</Badge>
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}
                    className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300">
                    <Check className="h-4 w-4 mr-2" /> Mark All as Read
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <motion.div key={notification.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                      <Card className={!notification.read ? "border-l-4 border-l-violet-600" : ""}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className={`${notification.bg} p-3 rounded-lg h-fit`}>
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className={!notification.read ? "font-semibold" : ""}>{notification.title}</h3>
                                <div className="flex gap-2">
                                  {!notification.read && (
                                    <Button size="sm" variant="ghost" onClick={() => handleMarkRead(notification.id)} className="h-8 px-2 hover:bg-green-50 hover:text-green-600">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)} className="h-8 px-2 hover:bg-red-50 hover:text-red-600">
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
    </div>
  );
}