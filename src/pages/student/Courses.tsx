// ============================================================
// Courses.tsx — Student Courses Page (Clean Version)
// Applies: Single Responsibility, DRY, Open/Closed
// ============================================================

import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Star, Clock, Play, ShoppingBag, CheckCircle2, Search, Menu } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";
import { getAllCourses } from "../../services/courseApi";
import { useNavigate } from "react-router-dom";
import { fetchMyCourses, fetchCourseVideosPreview } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface Props {
  logout: () => void;
  userRole: "student";
}

// ─── Pure helpers ─────────────────────────────────────────────

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const filterByQuery = (courses: any[], query: string): any[] => {
  if (!query.trim()) return courses;
  const q = query.toLowerCase();
  return courses.filter(
    (c) => c.title.toLowerCase().includes(q) || c.instructor_name.toLowerCase().includes(q)
  );
};

// ─── Sub-component: All Course Card ──────────────────────────

function AllCourseCard({ course, duration, onNavigate }: { course: any; duration: number; onNavigate: (id: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => onNavigate(course.id)}>
        <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating ?? 4.8}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{formatDuration(duration)}</span>
          </div>
          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
            <ShoppingBag className="mr-2 h-4 w-4" />View Course
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Sub-component: My Course Card ───────────────────────────

function MyCourseCard({ course, duration, onNavigate }: { course: any; duration: number; onNavigate: (id: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => onNavigate(course.id)}>
        <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating ?? 4.8}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{formatDuration(duration)}</span>
          </div>
          {course.progress_percentage === 100 ? (
            <div className="mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-100 to-cyan-100 rounded-lg py-2">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
              <span className="font-semibold text-violet-700">100% Complete</span>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span>{course.progress_percentage}%</span></div>
              <Progress value={course.progress_percentage} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
            </div>
          )}
          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
            <Play className="mr-2 h-4 w-4" />
            {course.progress_percentage === 100 ? "Review" : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function StudentCourses({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = React.useState<"all" | "my">("all");
  const [myCoursesTab, setMyCoursesTab] = React.useState<"in-progress" | "completed">("in-progress");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [courseDurations, setCourseDurations] = useState<Record<number, number>>({});
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });

    getAllCourses()
      .then((data: any) => setAllCourses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingAll(false));

    fetchMyCourses()
      .then((data: any) => setMyCourses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingMy(false));
  }, []);

  // Fetch durations for all courses
  useEffect(() => {
    if (!allCourses.length) return;
    const fetchDurations = async () => {
      const durations: Record<number, number> = {};
      for (const course of allCourses) {
        try {
          const videos: any = await fetchCourseVideosPreview(course.id);
          durations[course.id] = Array.isArray(videos)
            ? videos.reduce((sum: number, v: any) => sum + (v.duration ?? 0), 0)
            : 0;
        } catch { durations[course.id] = 0; }
      }
      setCourseDurations(durations);
    };
    fetchDurations();
  }, [allCourses]);

  const filteredAll = React.useMemo(() => filterByQuery(allCourses, searchQuery), [searchQuery, allCourses]);
  const filteredMy = React.useMemo(() => filterByQuery(myCourses, searchQuery), [searchQuery, myCourses]);

  const SearchBar = () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none transition-all duration-200" />
    </div>
  );

  if (loadingAll) return <div className="flex justify-center items-center py-20">Loading courses...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="flex relative overflow-hidden">
        <Sidebar menuItems={getStudentMenuItems("/student/courses")} logout={logout} userRole="student" activePage="student-courses" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 lg:ml-0 w-full overflow-hidden">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            {/* Mobile */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4 gap-4">
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div className="flex-1"><h1 className="text-xl">Courses</h1><p className="text-gray-600 text-sm">Explore All Courses</p></div>
                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
              <SearchBar />
            </div>
            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              <div className="flex-shrink-0"><h1 className="text-2xl">Courses</h1><p className="text-gray-600">Explore All Courses</p></div>
              <div className="relative flex-1 max-w-md"><SearchBar /></div>
              <div className="flex-shrink-0"><HeaderIcons logout={logout} userRole={userRole} /></div>
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            {/* View Toggle */}
            <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6 w-full sm:w-auto justify-center">
              {(["all", "my"] as const).map((view) => (
                <button key={view} onClick={() => setActiveView(view)}
                  className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-full transition-all duration-200 text-sm ${activeView === view ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  {view === "all" ? "All Courses" : "My Courses"}
                </button>
              ))}
            </div>

            {/* All Courses */}
            {activeView === "all" && (
              allCourses.length === 0 ? <p className="text-center text-gray-500 mt-10">No courses available</p> : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredAll.map((course) => (
                    <AllCourseCard key={course.id} course={course} duration={courseDurations[course.id] ?? 0} onNavigate={(id) => navigate(`/course-details/${id}`)} />
                  ))}
                </div>
              )
            )}

            {/* My Courses */}
            {activeView === "my" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {filteredMy.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">You are not enrolled in any courses yet</p>
                ) : (
                  <>
                    <div className="flex gap-2 mb-6">
                      {(["in-progress", "completed"] as const).map((tab) => (
                        <button key={tab} onClick={() => setMyCoursesTab(tab)}
                          className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${myCoursesTab === tab ? "bg-violet-100 text-violet-700 border-2 border-violet-300" : "bg-white text-gray-600 border-2 border-gray-200 hover:border-violet-200"}`}>
                          {tab === "in-progress" ? "In Progress" : "Completed"}
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredMy
                        .filter((c) => myCoursesTab === "in-progress" ? c.progress_percentage < 100 : c.progress_percentage === 100)
                        .map((course) => (
                          <MyCourseCard key={course.id} course={course} duration={courseDurations[course.id] ?? 0} onNavigate={(id) => navigate(`/course-details/${id}`)} />
                        ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}