// ============================================================
// Dashboard.tsx — Instructor Dashboard (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BookOpen, Users, Plus, MessageSquare, Eye, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchInstructorStats } from "./config/instructorApi";
import { getInstructorMenuItems } from "./config/instructorMenu";

interface Props { logout: () => void; userRole: "instructor"; }

export default function InstructorDashboard({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [stats, setStats] = useState({ total_courses: 0, total_students: 0, top_courses: [] as any[] });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = (user?.full_name || "Instructor").split(" ")[0];

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "instructor") navigate(`/${u.role}/dashboard`, { replace: true });

    fetchInstructorStats().then((data: any) => setStats(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getInstructorMenuItems("/instructor/dashboard")} logout={logout} userRole="instructor" activePage="instructor-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div><h1 className="text-2xl">Dashboard</h1><p className="text-gray-600">Welcome back, {firstName}!</p></div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[
                { label: "Total Courses", value: loading ? "..." : stats.total_courses, sub: "Nice work", icon: <BookOpen className="h-5 w-5 text-blue-600" />, subColor: "text-green-600" },
                { label: "Total Students", value: loading ? "..." : stats.total_students, sub: "Keep going", icon: <Users className="h-5 w-5 text-purple-600" />, subColor: "text-green-600" },
              ].map(({ label, value, sub, icon, subColor }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
                  <Card><CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2"><span className="text-gray-600">{label}</span>{icon}</div>
                    <div className="text-3xl mb-1">{value}</div>
                    <div className={`text-sm ${subColor}`}>{sub}</div>
                  </CardContent></Card>
                </motion.div>
              ))}
            </div>

            <Card className="mb-6">
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" onClick={() => navigate("/instructor/courses")}>
                    <Plus className="mr-2 h-5 w-5" />Create New Course
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/community")}>
                    <MessageSquare className="mr-2 h-5 w-5" />View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Courses</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/instructor/courses")}>View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_courses.map((course: any, index: number) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="mb-1 font-medium">#{index + 1} {course.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" /><span>{course.total_students} students enrolled</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/edit-course", { state: { courseId: course.id } })}>
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