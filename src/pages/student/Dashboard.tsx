// ============================================================
// Dashboard.tsx — Student Dashboard (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Code, Map, Star, Menu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";
import TestimonialForm from "../../components/TestimonialForm";
import { useNavigate } from "react-router-dom";
import { fetchMyStats, fetchMyCourses } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface StudentDashboardProps {
  logout: () => void;
  userRole: "student";
}

export default function StudentDashboard({ logout, userRole }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_enrolled_courses: 0, total_completed_courses: 0, total_time_spent_hours: 0 });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = (user?.full_name || "Student").split(" ")[0];
  const totalInProgress = stats.total_enrolled_courses - stats.total_completed_courses;
  const inProgressCourses = courses.filter((c) => c.progress_percentage < 100);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });

    fetchMyStats().then((data: any) => setStats(data)).catch(console.error);
    fetchMyCourses().then((data: any) => setCourses(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        <Sidebar menuItems={getStudentMenuItems("/student/dashboard")} logout={logout} userRole="student" activePage="student-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">Welcome back, {firstName}!</h1>
                <p className="text-gray-600 text-sm md:text-base">Continue your learning journey</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              {[
                { label: "Enrolled Courses", value: stats.total_enrolled_courses, sub: `${totalInProgress} in progress`, icon: <BookOpen className="h-5 w-5 text-blue-600" />, subColor: "text-gray-600" },
                { label: "Learning Hours", value: stats.total_time_spent_hours, sub: "Keep going", icon: <Clock className="h-5 w-5 text-purple-600" />, subColor: "text-green-600" },
              ].map(({ label, value, sub, icon, subColor }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">{label}</span>{icon}
                      </div>
                      <div className="text-3xl mb-1">{value}</div>
                      <div className={`text-sm ${subColor}`}>{sub}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Continue Learning */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader><CardTitle>Continue Learning</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {inProgressCourses.length > 0 ? (
                        inProgressCourses.map((course) => (
                          <div key={course.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/course-details/${course.id}`)}>
                            <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover" />
                            <div className="flex-1">
                              <h3 className="mb-2">{course.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">Instructor: {course.instructor_name}</p>
                              <div className="flex items-center gap-3">
                                <Progress value={course.progress_percentage} className="flex-1 h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
                                <span className="text-sm">{course.progress_percentage}%</span>
                              </div>
                            </div>
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500 w-full sm:w-auto">Continue</Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-10">No active courses at the moment. Explore our courses to get started</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Cards */}
              <div className="space-y-6">
                {[
                  { icon: <Map className="h-10 w-10 text-cyan-600 mb-3" />, title: "Learning Roadmaps", sub: "Recommended learning paths", path: "/student/roadmaps" },
                  { icon: <Code className="h-10 w-10 text-purple-600 mb-3" />, title: "Code Compiler", sub: "Practice coding in your browser", path: "/student/compiler" },
                ].map(({ icon, title, sub, path }) => (
                  <Card key={title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(path)}>
                    <CardContent className="pt-6">{icon}<h3 className="mb-1">{title}</h3><p className="text-sm text-gray-600">{sub}</p></CardContent>
                  </Card>
                ))}

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-200" onClick={() => setIsTestimonialOpen(true)}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                    <h3 className="mb-1 text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text">Share Your Experience</h3>
                    <p className="text-sm text-gray-600">Help others by sharing your journey</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />

      <Dialog open={isTestimonialOpen} onOpenChange={setIsTestimonialOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide [&_[data-slot='dialog-close']]:hidden">
          <TestimonialForm onClose={() => setIsTestimonialOpen(false)} studentName="Alex Johnson" studentRole="Software Engineering Student" />
        </DialogContent>
      </Dialog>
    </div>
  );
}