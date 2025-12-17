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
  ArrowLeft,
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';

import { NavigateFn } from '../../types/Navigation';
import { UserRole } from '../../App';

interface InstructorCourseViewProps {
  navigate: NavigateFn;
  logout: () => void;
  userRole: UserRole;
  navigationState?: {
    courseId?: number;
    courseStatus?: 'draft' | 'published';
  };
}

export default function InstructorCourseView({
  navigate,
  logout,
  userRole,
  navigationState,
}: InstructorCourseViewProps) {
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

  const courseId = navigationState?.courseId;

  const [course, setCourse] = useState({
    id: courseId ?? 1,
    title: 'Complete Web Development Bootcamp',
    description:
      'Learn web development from scratch with hands-on projects and real-world examples.',
    category: 'Web Development',
    level: 'Beginner',
    status: navigationState?.courseStatus ?? 'draft',
    thumbnail:
      'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1',
    students: 1250,
    rating: 4.9,
    revenue: 24500,
    videos: [
      { id: 1, title: 'Introduction', duration: '12:34', order: 1 },
      { id: 2, title: 'HTML Basics', duration: '25:18', order: 2 },
    ],
  });

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);

  const handlePublishCourse = async () => {
    // PUT /api/courses/:id/publish
    setCourse({ ...course, status: 'published' });
    setShowPublishDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="instructor"
          activePage="instructor-courses"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('instructor-courses')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Course Details</h1>
                  <p className="text-gray-600">View and manage your course</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('instructor-edit-course', undefined, {
                      courseId: course.id,
                    })
                  }
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>

                {course.status === 'draft' && (
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-cyan-500"
                    onClick={() => setShowPublishDialog(true)}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                <ImageWithFallback
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-3xl">{course.title}</h2>

                  <div className="flex gap-2">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge
                      className={
                        course.status === 'published'
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }
                    >
                      {course.status}
                    </Badge>
                  </div>

                  <p className="text-gray-600">{course.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between mb-6">
                  <h3 className="text-xl">Videos</h3>
                  <Button
                    onClick={() => setShowAddVideoDialog(true)}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Video
                  </Button>
                </div>

                {course.videos.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Play className="mx-auto h-10 w-10 mb-3" />
                    No videos yet
                  </div>
                ) : (
                  course.videos.map((video) => (
                    <motion.div
                      key={video.id}
                      className="flex justify-between p-4 border rounded-lg mb-2"
                    >
                      <div>
                        <h4>{video.title}</h4>
                        <p className="text-sm text-gray-600">{video.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to publish this course?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishCourse}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIAssistant />
    </div>
  );
}
