import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, BookOpen, MessageSquare, FileText, Bell, User, Settings, LogOut, Search, Filter, Ban, CheckCircle, Eye, Menu } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Code2 } from 'lucide-react';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { COURSE_CATEGORIES } from "../../constants/courseCategories";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CoursesProps {
  logout: () => void;
  userRole: string;
}

interface CourseData {
  id: number;
  courseName: string;
  instructor: string;
  category: string;
  enrolledStudents: number;
  status: 'Active' | 'Suspended';
  rating?: number;
  totalReviews?: number;
  description?: string;
  thumbnail?: string;
  duration?: string;
  language?: string;
  level?: string;
  lastUpdated?: string;
}



export default function AdminCourses({ logout }: CoursesProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    course: CourseData | null;
    action: 'suspend' | 'activate';
  }>({ show: false, course: null, action: 'suspend' });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses', active: true },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  const filterCourses = () => {
    return coursesData.filter(course => {
      const matchesSearch =
        (course.courseName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (course.instructor?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const categories = ['all', ...Array.from(new Set(coursesData.map(c => c.category)))];

  const handleAction = (course: CourseData, action: 'suspend' | 'activate') => {
    setConfirmAction({ show: true, course, action });
  };


  const confirmActionHandler = async () => {
    const course = confirmAction.course;
    if (!course) return;

    try {
      const res = await fetch(
        `http://localhost:5000/admin/courses/${course.id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cannot activate course");
        return;
      }

      const updatedCourse = data.course;

      setCoursesData(prev =>
        prev.map(c =>
          c.id === updatedCourse.id
            ? {
              ...c,
              status: updatedCourse.is_active ? 'Active' : 'Suspended'
            }
            : c
        )
      );

    } catch (err) {
      console.error(err);
    }

    setConfirmAction({ show: false, course: null, action: 'suspend' });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });

        const data = await res.json();

        const mappedData = data.map((course: any) => ({
          id: course.id,
          courseName: course.course_name || course.name || course.title || "No Name",
          instructor: course.instructor_name || course.instructor || "Unknown",
          category: COURSE_CATEGORIES[course.category] || course.category,
          enrolledStudents: course.enrolled_students || 0,
          status: course.status === 'active' ? 'Active' : 'Suspended'
        }));

        setCoursesData(mappedData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="admin"
          activePage="admin-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
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
                    <Input
                      placeholder="Search courses or instructors..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
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
                      {filterCourses().map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell className="text-gray-600">{course.instructor}</TableCell>
                          <TableCell>
                            <Badge className="bg-violet-100 text-violet-700">{course.category}</Badge>
                          </TableCell>
                          <TableCell>{course.enrolledStudents.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-violet-600 hover:bg-violet-50 border-violet-200"
                                onClick={() =>
                                  navigate('/admin/course-details', { state: { courseId: course.id } })
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              {course.status === 'Active' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => handleAction(course, 'suspend')}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50 border-green-200"
                                  onClick={() => handleAction(course, 'activate')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
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

      <AIAssistant />

      <AlertDialog open={confirmAction.show} onOpenChange={() => setConfirmAction({ show: false, course: null, action: 'suspend' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction.action === 'suspend' ? 'Suspend Course' : 'Activate Course'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction.action === 'suspend' ? 'suspend' : 'activate'} the course "{confirmAction.course?.courseName}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActionHandler}>
              {confirmAction.action === 'suspend' ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}