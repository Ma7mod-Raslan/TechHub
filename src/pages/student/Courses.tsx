import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
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
  Menu,
  Search,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import Sidebar from '../../components/Sidebar';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import { getAllCourses } from "../../services/courseApi";


interface StudentCoursesProps {
  navigate: (page: string, role?: any, state?: any) => void;
  logout: () => void;
  userRole: 'student';
}




export default function StudentCourses({ navigate, logout, userRole }: StudentCoursesProps) {
  const [activeView, setActiveView] = React.useState<'all' | 'my'>('all');
  const [myCoursesTab, setMyCoursesTab] = React.useState<'in-progress' | 'completed'>('in-progress');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [courseDurations, setCourseDurations] = useState<Record<number, number>>({});
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);




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



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        console.log("ALL COURSES FROM API:", data);

        const courses = await getAllCourses();
        setAllCourses(Array.isArray(courses) ? courses : []);

      } catch (err) {
        console.error("Error fetching courses", err);
        setAllCourses([]);
      } finally {
        setLoadingAll(false);
      }
    };

    fetchCourses();
  }, []);




  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me/my-courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        setMyCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMyCourses([]);
      } finally {
        setLoadingMy(false);
      }
    };

    fetchMyCourses();
  }, []);

  useEffect(() => {
    const fetchDurations = async () => {
      const durations: Record<number, number> = {};

      for (const course of allCourses) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/courses/${course.id}/videos-preview`
          );

          const videos = await res.json();

          const totalSeconds = Array.isArray(videos)
            ? videos.reduce((sum, v) => sum + (v.duration ?? 0), 0)
            : 0;

          durations[course.id] = totalSeconds;
        } catch {
          durations[course.id] = 0;
        }
      }

      setCourseDurations(durations);
    };

    if (allCourses.length > 0) {
      fetchDurations();
    }
  }, [allCourses]);







  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "—";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };





  const handleLogout = () => {
    logout();
    navigate('login');
  };

  // Filter courses based on search query
  const filteredMyCourses = React.useMemo(() => {
    if (!Array.isArray(myCourses)) return [];

    if (!searchQuery.trim()) return myCourses;

    const query = searchQuery.toLowerCase();
    return myCourses.filter((course) =>
      course.title.toLowerCase().includes(query) ||
      course.instructor_name.toLowerCase().includes(query)
    );
  }, [searchQuery, myCourses]);

  const filteredAllCourses = React.useMemo(() => {
    if (!Array.isArray(allCourses)) return [];

    if (!searchQuery.trim()) return allCourses;

    const query = searchQuery.toLowerCase();

    return allCourses.filter((course) =>
      course.title.toLowerCase().includes(query) ||
      course.instructor_name.toLowerCase().includes(query)
    );
  }, [searchQuery, allCourses]);





  // Helper function to render course card for "All Courses" view
  const renderAllCoursesCard = (course: any) => (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => navigate("course-details", undefined, { courseId: course.id })}

      >
        <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating ?? 4.8}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span> {formatDuration(courseDurations[course.id])} </span>

          </div>
          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Course
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Helper function to render course card for "My Courses" view
  const renderMyCoursesCard = (course: any) => (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() =>
        navigate('course-details', undefined, { courseId: course.id })
      }
      >
        <ImageWithFallback src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating ?? 4.8}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{formatDuration(courseDurations[course.id])}</span>
          </div>
          {course.progress_percentage === 100 ? (
            <div className="mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-100 to-cyan-100 rounded-lg py-2">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
              <span className="font-semibold text-violet-700">100% Complete</span>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>{course.progress_percentage}%</span>
              </div>
              <Progress value={course.progress_percentage} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
            </div>
          )}
          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
            <Play className="mr-2 h-4 w-4" />
            {course.progress_percentage === 100 ? 'Review' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loadingAll) {
    return (
      <div className="flex justify-center items-center py-20">
        Loading courses...
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="flex relative overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-courses"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 lg:ml-0 w-full overflow-hidden">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            {/* Mobile: Two-row layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4 gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="flex-1">
                  <h1 className="text-xl">Courses</h1>
                  <p className="text-gray-600 text-sm">Explor All Courses</p>
                </div>
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Desktop: Single-row layout with search in the middle */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              <div className="flex-shrink-0">
                <h1 className="text-2xl">Courses</h1>
                <p className="text-gray-600">Explor All Courses</p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none transition-all duration-200"
                />
              </div>
              <div className="flex-shrink-0">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            {/* Main View Toggle - Compact Segmented Control */}
            <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6 w-full sm:w-auto justify-center">
              <button
                onClick={() => setActiveView('all')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-full transition-all duration-200 text-sm ${activeView === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                All Courses
              </button>
              <button
                onClick={() => setActiveView('my')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-full transition-all duration-200 text-sm ${activeView === 'my'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                My Courses
              </button>
            </div>

            {/* All Courses View */}
            {activeView === 'all' && (
              loadingAll ? (
                <p className="text-center mt-10">
                  Loading courses...
                </p>
              ) : allCourses.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">
                  No courses available
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredAllCourses.map(renderAllCoursesCard)}
                </div>
              )
            )}


            {/* My Courses View with Internal Tabs */}
            {activeView === 'my' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {filteredMyCourses.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">
                    You are not enrolled in any courses yet
                  </p>
                ) : (
                  <>
                    {/* Internal Tabs */}
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => setMyCoursesTab('in-progress')}
                        className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${myCoursesTab === 'in-progress'
                          ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                          : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-violet-200'
                          }`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() => setMyCoursesTab('completed')}
                        className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${myCoursesTab === 'completed'
                          ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                          : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-violet-200'
                          }`}
                      >
                        Completed
                      </button>
                    </div>

                    {/* In Progress */}
                    {myCoursesTab === 'in-progress' && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredMyCourses
                          .filter((c) => c.progress_percentage < 100)
                          .map(renderMyCoursesCard)}
                      </div>
                    )}

                    {/* Completed */}
                    {myCoursesTab === 'completed' && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredMyCourses
                          .filter((c) => c.progress_percentage === 100)
                          .map(renderMyCoursesCard)}
                      </div>
                    )}
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