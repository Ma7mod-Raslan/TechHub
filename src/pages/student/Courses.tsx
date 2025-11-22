import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Users,
  Code,
  Map,
  Bell,
  User,
  Settings,
  Code2,
  Star,
  Clock,
  Play,
  ArrowRight,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentCoursesProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

interface Course {
  id: number | string;
  title: string;
  instructor?: string;
  rating?: number;
  duration?: string;
  image?: string;
  // keep progress out of the Course type — we'll attach it from enrollments
}

export default function StudentCourses({ navigate, logout, userRole }: StudentCoursesProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses', active: true },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState<Record<string | number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
       * TEMP: using mock data for now until backend finishes the real API.
       * Once the API is ready, I'll replace this whole block with:
       *   - fetch('/api/courses') to load all courses
       *   - fetch('/api/student/enrollments') to get progress for each course
       *
       * Notes to myself:
       *   - remove the mock setTimeout
       *   - map the real API response to the same structure I'm using below
       *   - make sure to handle errors + loading states when switching to the real API
    */

    setTimeout(() => {
      // mock courses array
      setCourses([
        {
          id: 1,
          title: 'Complete Web Development Bootcamp',
          instructor: 'Sarah Johnson',
          rating: 4.9,
          duration: '42 hours',
          image: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?w=400',
        },
        {
          id: 2,
          title: 'Python for Data Science',
          instructor: 'Dr. Alex Chen',
          rating: 4.8,
          duration: '36 hours',
          image: 'https://images.unsplash.com/photo-1762330910399-95caa55acf04?w=400',
        },
        {
          id: 3,
          title: 'React Masterclass',
          instructor: 'Maria Garcia',
          rating: 4.9,
          duration: '28 hours',
          image: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?w=400',
        },
        {
          id: 4,
          title: 'Machine Learning Fundamentals',
          instructor: 'Dr. James Wilson',
          rating: 4.7,
          duration: '45 hours',
          image: 'https://images.unsplash.com/photo-1688413709025-5f085266935a?w=400',
        },
        {
          id: 5,
          title: 'Advanced JavaScript',
          instructor: 'Emily Davis',
          rating: 4.8,
          duration: '32 hours',
          image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
        },
        {
          id: 6,
          title: 'Node.js Complete Guide',
          instructor: 'Michael Brown',
          rating: 4.9,
          duration: '38 hours',
          image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400',
        },
      ]);

      // mock progress map
      setEnrollmentsMap({
        1: 65,
        2: 42,
        3: 100,
        4: 28,
        5: 85,
        6: 100,
      });

      setLoading(false);
    }, 400); // small delay to simulate loading
  }, []);

  const handleLogout = () => {
    logout();
    navigate('student-login');
  };

  // renderCourseCard: small helper to keep JSX tidy
  const renderCourseCard = (course: Course) => {
    const progress = enrollmentsMap[course.id] ?? 0;
    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={() => navigate(`course-details/${course.id}`)}
        >
          <ImageWithFallback
            // fallback to the local image you provided earlier in the project
            src={course.image || '/mnt/data/f718b916-2f8f-4cde-b382-e80b4b5d2ac0.png'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <CardContent className="p-4">
            <h3 className="mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating ?? '4.8'}</span>
              <span>•</span>
              <Clock className="h-4 w-4" />
              <span>{course.duration ?? '—'}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`course-details/${course.id}`);
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              {progress === 100 ? 'Review' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar
            menuItems={menuItems}
            navigate={navigate}
            logout={logout}
            userRole="student"
            activePage="student-courses"
          />
          <div className="flex-1 p-6">
            <h1 className="text-2xl mb-2">My Courses</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar
            menuItems={menuItems}
            navigate={navigate}
            logout={logout}
            userRole="student"
            activePage="student-courses"
          />
          <div className="flex-1 p-6">
            <h1 className="text-2xl mb-2">My Courses</h1>
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // split courses into tabs using the merged progress data
  const allWithProgress = courses.map((c) => ({ course: c, progress: enrollmentsMap[c.id] ?? 0 }));
  const inProgress = allWithProgress.filter((x) => x.progress > 0 && x.progress < 100).map(x => x.course);
  const completed = allWithProgress.filter((x) => x.progress === 100).map(x => x.course);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-courses"
        />

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">My Courses</h1>
                <p className="text-gray-600">Track your learning progress</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Courses</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="in-progress" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completed.map(renderCourseCard)}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
