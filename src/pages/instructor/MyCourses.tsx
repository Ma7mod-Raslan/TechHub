import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
  Code2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  LogOut,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

import { NavigateFn } from '../../types/Navigation';
import { UserRole } from '../../App';
import { COURSE_CATEGORIES } from '../../constants/courseCategories';

interface InstructorCoursesProps {
  navigate: NavigateFn;
  logout: () => void;
  userRole: UserRole;
}



export default function InstructorCourses({ navigate, logout, userRole }: InstructorCoursesProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; courseId: number | null; courseTitle: string }>({
    open: false,
    courseId: null,
    courseTitle: '',
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses', active: true },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const res = await fetch('http://localhost:3000/api/courses/instructor', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load courses');

        const data = await res.json();
        setCourses(data.courses ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);


  // Filter courses based on search query and active tab
  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'published') {
      matchesTab = course.status?.toLowerCase() === 'published';
    } else if (activeTab === 'draft') {
      matchesTab = course.status?.toLowerCase() === 'draft';
    }


    return matchesSearch && matchesTab;
  });



  const handleDeleteCourse = async (courseId: number) => {

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(
        `http://localhost:3000/api/courses/${courseId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to delete course');
      }

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete course');
    }
  };


  const openDeleteDialog = (courseId: number, courseTitle: string) => {
    setDeleteDialog({ open: true, courseId, courseTitle });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="instructor"
          activePage="instructor-courses"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">

              {/* Left side: Menu + Title */}
              <div className="flex items-center gap-3">

                {/* ☰ Menu (mobile only) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div>
                  <h1 className="text-2xl">My Courses</h1>
                  <p className="text-gray-600">Manage and create your courses</p>
                </div>
              </div>

              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />

                <Button
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                  onClick={() => navigate('instructor-create-course')}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Course
                </Button>
              </div>
            </div>

            <div className="mt-3 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>


          {/* Content */}
          <main className="p-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
                <TabsTrigger value="published">
                  Published ({courses.filter((c) => c.status?.toLowerCase() === 'published').length})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Drafts ({courses.filter((c) => c.status?.toLowerCase() === 'draft').length})
                </TabsTrigger>

              </TabsList>

              <TabsContent value={activeTab}>
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl mb-2">
                      {searchQuery ? 'No courses found' : 'No courses yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery
                        ? 'Try adjusting your search query'
                        : 'Create your first course to get started'}
                    </p>
                    {!searchQuery && (
                      <Button
                        className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                        onClick={() => navigate('instructor-create-course')}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Create Course
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="relative">
                            <ImageWithFallback
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-48 object-cover"
                            />

                            <Badge
                              className={`absolute top-2 right-2 ${course.status?.toLowerCase() === 'published'
                                ? 'bg-green-600'
                                : 'bg-yellow-600'
                                }`}
                            >
                              {course.status}
                            </Badge>
                          </div>

                          <CardContent className="p-4">
                            <Badge className="mb-2" variant="outline">
                              {COURSE_CATEGORIES[course.category] ?? course.category}
                            </Badge>

                            <h3 className="mb-4 line-clamp-1">{course.title}</h3>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  navigate('instructor-edit-course', undefined, {
                                    courseId: course.id,
                                  })
                                }
                              >
                                <Edit className="mr-1 h-4 w-4" />
                                {course.status?.toLowerCase() === 'draft' ? 'Continue' : 'Edit'}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  navigate('instructor-course-view', undefined, {
                                    courseId: course.id,
                                    courseStatus: course.status,
                                  })
                                }
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDeleteDialog(course.id, course.title)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {/* DEVELOPER: Confirmation modal for course deletion
          - On confirm: DELETE /api/courses/:courseId
          - On success: Remove from list, show toast */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) =>
        setDeleteDialog({ ...deleteDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Course
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteDialog.courseTitle}</strong>?
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. All course content, videos, and student enrollments will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, courseId: null, courseTitle: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog.courseId) {
                  handleDeleteCourse(deleteDialog.courseId);
                  setDeleteDialog({ open: false, courseId: null, courseTitle: '' });
                }
              }}
            >
              Delete
            </Button>


          </div>
        </DialogContent>
      </Dialog>

      <AIAssistant />
    </div>
  );
}