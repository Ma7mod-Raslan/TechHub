import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

import { NavigateFn } from '../../types/Navigation';
import { UserRole } from '../../App';

interface InstructorCoursesProps {
  navigate: NavigateFn;
  logout: () => void;
  userRole: UserRole;
}


const courses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    category: 'Web Development',
    students: 1250,
    rating: 4.9,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjI2MTM4NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    revenue: 24500,
  },
  {
    id: 2,
    title: 'Python for Data Science',
    category: 'Data Science',
    students: 980,
    rating: 4.8,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1762330910399-95caa55acf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZWR1Y2F0aW9uJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYyNzAxOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    revenue: 19600,
  },
  {
    id: 3,
    title: 'React Masterclass',
    category: 'Web Development',
    students: 750,
    rating: 4.7,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNofGVufDF8fHx8MTc2MjYxMjQyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    revenue: 15000,
  },
  {
    id: 4,
    title: 'Advanced JavaScript Concepts',
    category: 'Web Development',
    students: 1150,
    rating: 4.9,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400',
    revenue: 22000,
  },
  {
    id: 5,
    title: 'Node.js Backend Development',
    category: 'Web Development',
    students: 890,
    rating: 4.8,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    revenue: 17800,
  },
  {
    id: 6,
    title: 'SQL Database Mastery',
    category: 'Data Science',
    students: 670,
    rating: 4.6,
    status: 'published',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    revenue: 13400,
  },
  {
    id: 7,
    title: 'Machine Learning Fundamentals',
    category: 'AI & ML',
    students: 0,
    rating: 0,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc2MjY0NjI5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    revenue: 0,
  },
  {
    id: 8,
    title: 'iOS App Development with Swift',
    category: 'Mobile Dev',
    students: 0,
    rating: 0,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    revenue: 0,
  },
  {
    id: 9,
    title: 'Cybersecurity Essentials',
    category: 'Security',
    students: 0,
    rating: 0,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
    revenue: 0,
  },
];

export default function InstructorCourses({ navigate, logout, userRole }: InstructorCoursesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; courseId: number | null; courseTitle: string }>({
    open: false,
    courseId: null,
    courseTitle: '',
  });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses', active: true },
    { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

  // DEVELOPER: Filter courses based on search query and active tab
  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'published') {
      matchesTab = course.status === 'published';
    } else if (activeTab === 'draft') {
      matchesTab = course.status === 'draft';
    }

    return matchesSearch && matchesTab;
  });

  // DEVELOPER: Handle course deletion
  const handleDeleteCourse = async () => {
    const courseId = deleteDialog.courseId;

    // API Call: DELETE /api/courses/:courseId
    // On success:
    // - Remove course from courses array
    // - Show toast: "Course deleted successfully"
    // On error:
    // - Show error toast

    // Mock implementation
    console.log(`DELETE /api/courses/${courseId}`);
    setDeleteDialog({ open: false, courseId: null, courseTitle: '' });
    // Show toast: "Course deleted successfully"
  };

  // DEVELOPER: Open delete confirmation dialog
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
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">My Courses</h1>
                <p className="text-gray-600">Manage and create your courses</p>
              </div>
              {/* DEVELOPER: Centered Search Bar in Header */}
              <div className="flex-1 max-w-md mx-8">
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
              <div className="flex items-center gap-3">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
                {/* DEVELOPER: Create Course button navigates to instructor-create-course */}
                <Button
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                  onClick={() => navigate('instructor-create-course')}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Course
                </Button>
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
                  Published ({courses.filter((c) => c.status === 'published').length})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Drafts ({courses.filter((c) => c.status === 'draft').length})
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
                              src={course.image}
                              alt={course.title}
                              className="w-full h-48 object-cover"
                            />
                            <Badge
                              className={`absolute top-2 right-2 ${course.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
                                }`}
                            >
                              {course.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <Badge className="mb-2" variant="outline">
                              {course.category}
                            </Badge>
                            <h3 className="mb-2 line-clamp-1">{course.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex justify-between">
                                <span>Students:</span>
                                <span>{course.status === 'draft' ? 'N/A' : course.students}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rating:</span>
                                <span>{course.status === 'draft' ? 'N/A' : course.rating}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{course.status === 'draft' ? 'Status:' : 'Revenue:'}</span>
                                <span>
                                  {course.status === 'draft'
                                    ? <span className="text-yellow-600">In Progress</span>
                                    : `$${course.revenue.toLocaleString()}`
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {/* DEVELOPER: Edit button - navigates to edit page with courseId */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(
                                  'instructor-edit-course',
                                  undefined,
                                  { courseId: course.id }
                                )
                                }
                              >
                                <Edit className="mr-1 h-4 w-4" />
                                {course.status === 'draft' ? 'Continue' : 'Edit'}
                              </Button>
                              {/* DEVELOPER: View button - navigates to course view with courseId */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(
                                  'instructor-course-view',
                                  undefined,
                                  {
                                    courseId: course.id,
                                    courseStatus: course.status,
                                  }
                                )
                                }
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              {/* DEVELOPER: Delete button - opens confirmation modal */}
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
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteCourse}
            >
              Delete Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AIAssistant />
    </div>
  );
}