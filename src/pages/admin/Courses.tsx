// ============================================================
// Courses.tsx — Admin Course Management (Clean Version)
// Applies: Single Responsibility, DRY, Open/Closed
// ============================================================

import { useEffect, useState } from "react";
import { Search, Eye, Ban, CheckCircle, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchAllCourses, toggleCourseStatus } from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";
import { COURSE_CATEGORIES } from "../../constants/courseCategories";

interface AdminCoursesProps {
  logout: () => void;
  userRole: string;
}

interface CourseData {
  id: number;
  courseName: string;
  instructor: string;
  category: string;
  enrolledStudents: number;
  status: "Active" | "Suspended";
}

// ─── Pure mapper ─────────────────────────────────────────────

const mapCourse = (course: any): CourseData => ({
  id: course.id,
  courseName: course.course_name ?? course.name ?? course.title ?? "No Name",
  instructor: course.instructor_name ?? course.instructor ?? "Unknown",
  category: COURSE_CATEGORIES[course.category] ?? course.category,
  enrolledStudents: course.enrolled_students ?? 0,
  status: course.status === "active" ? "Active" : "Suspended",
});

// ─── Main Component ──────────────────────────────────────────

export default function AdminCourses({ logout }: AdminCoursesProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean; course: CourseData | null; action: "suspend" | "activate";
  }>({ show: false, course: null, action: "suspend" });

  useEffect(() => {
    fetchAllCourses()
      .then((data: any) => setCourses(data.map(mapCourse)))
      .catch(console.error);
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      (c.courseName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.instructor ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(courses.map((c) => c.category)))];

  const handleConfirm = async () => {
    if (!confirmAction.course) return;
    try {
      const data: any = await toggleCourseStatus(confirmAction.course.id);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === data.course.id ? { ...c, status: data.course.is_active ? "Active" : "Suspended" } : c
        )
      );
    } catch (err: any) {
      toast.error(err.message ?? "Cannot change course status");
    }
    setConfirmAction({ show: false, course: null, action: "suspend" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/courses")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Course Management</h1>
                <p className="text-gray-600">View and manage all courses on the platform</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-courses" />
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search courses or instructors..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Enrolled Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell className="text-gray-600">{course.instructor}</TableCell>
                          <TableCell><Badge className="bg-violet-100 text-violet-700">{course.category}</Badge></TableCell>
                          <TableCell>{course.enrolledStudents.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={course.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-violet-600 hover:bg-violet-50 border-violet-200"
                                onClick={() => navigate("/admin/course-details", { state: { courseId: course.id } })}>
                                <Eye className="h-4 w-4 mr-2" /> View
                              </Button>
                              {course.status === "Active" ? (
                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => setConfirmAction({ show: true, course, action: "suspend" })}>
                                  <Ban className="h-4 w-4 mr-2" /> Suspend
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200"
                                  onClick={() => setConfirmAction({ show: true, course, action: "activate" })}>
                                  <CheckCircle className="h-4 w-4 mr-2" /> Activate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <AlertDialog open={confirmAction.show} onOpenChange={() => setConfirmAction({ show: false, course: null, action: "suspend" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction.action === "suspend" ? "Suspend Course" : "Activate Course"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction.action} "{confirmAction.course?.courseName}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmAction.action === "suspend" ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}