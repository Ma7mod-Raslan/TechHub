// ============================================================
// Assignments.tsx — Instructor Assignments (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchInstructorCourses } from "./config/instructorApi";
import { getInstructorMenuItems } from "./config/instructorMenu";

interface Props { logout: () => void; userRole: any; }

export default function InstructorAssignments({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation() as { state: { courseId?: number } };
  const courseId = location.state?.courseId;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u || u.role !== "instructor") { navigate("/login", { replace: true }); return; }

    fetchInstructorCourses()
      .then((data: any) => setCourses(data.courses ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (courseId) navigate("/instructor/manage-assignment", { state: { courseId } });
  }, [courseId]);

  const filteredCourses = courses.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const SearchBar = ({ className = "" }) => (
    <input type="text" placeholder="Search courses..." value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none ${className}`} />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getInstructorMenuItems("/instructor/assignments")} logout={logout} userRole="instructor" activePage="instructor-assignments" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            {/* Mobile */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4 gap-4">
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div className="flex-1"><h1 className="text-xl">Assessments</h1><p className="text-gray-600 text-sm">Manage your course assessments</p></div>
                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
              <SearchBar className="w-full" />
            </div>
            {/* Desktop */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              <div><h1 className="text-2xl">Assessments</h1><p className="text-gray-600 text-sm">Manage your course assessments</p></div>
              <SearchBar className="w-full flex-1 max-w-md" />
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No courses found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }}>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/instructor/manage-assignment", { state: { courseId: course.id } })}>
                      <div className="relative h-48">
                        <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg mb-2 line-clamp-2 text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{course.questions_count ?? 0} Questions</p>
                        <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                          onClick={(e) => { e.stopPropagation(); navigate("/instructor/manage-assignment", { state: { courseId: course.id } }); }}>
                          Manage Assessment
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}