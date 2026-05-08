// ============================================================
// Dashboard.tsx — Admin Dashboard Page (Clean Version)
// Applies: Single Responsibility — UI only, no raw fetch calls
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Users, BookOpen, AlertCircle, Shield, FileText, Bell, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboardStats,
  fetchDashboardActivity,
  fetchRecentUsers,
} from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";

interface AdminDashboardProps {
  logout: () => void;
  userRole: string;
}

export default function AdminDashboard({ logout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login", { replace: true });

    fetchDashboardStats().then(setStats).catch(console.error);
    fetchDashboardActivity().then((data: any) => setActivityData(data)).catch(console.error);
    fetchRecentUsers().catch(console.error); // kept for potential future use
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          menuItems={getAdminMenuItems("/admin/dashboard")}
          logout={logout}
          userRole="admin"
          activePage="admin-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, Administrator!</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-dashboard" />
            </div>
          </header>

          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                { label: "Total Users",       value: stats?.totalUsers?.value,        sub: `+${stats?.totalUsers?.growth ?? 0}% from last month`,       icon: <Users className="h-5 w-5 text-blue-600" />,   subColor: "text-green-600"  },
                { label: "Total Instructors", value: stats?.totalInstructors?.value,  sub: `+${stats?.totalInstructors?.growth ?? 0}% from last month`,  icon: <Shield className="h-5 w-5 text-purple-600" />, subColor: "text-green-600"  },
                { label: "Active Courses",    value: stats?.activeCourses?.value,     sub: `+${stats?.activeCourses?.thisWeek ?? 0} this week`,           icon: <BookOpen className="h-5 w-5 text-cyan-600" />, subColor: "text-green-600"  },
                { label: "Reports",           value: stats?.reports?.value,           sub: `${stats?.reports?.pending ?? 0} pending review`,             icon: <AlertCircle className="h-5 w-5 text-red-600" />, subColor: "text-yellow-600" },
              ].map(({ label, value, sub, icon, subColor }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">{label}</span>
                        {icon}
                      </div>
                      <div className="text-3xl mb-1">{value ?? 0}</div>
                      <div className={`text-sm ${subColor}`}>{sub}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Line type="monotone" dataKey="users" stroke="#7F56D9" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Course Growth</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" /><YAxis /><Tooltip />
                          <Bar dataKey="courses" fill="#06B6D4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}