import React from 'react';
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
  MessageSquare,
  Star,
  Clock,
  ShoppingBag,
  Play,
} from "lucide-react";

import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import Sidebar from '../../components/Sidebar';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';

interface StudentCoursesProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

const courses = [
  { id: 1, title: 'Complete Web Development Bootcamp', instructor: 'Sarah Johnson', progress: 65, rating: 4.9, duration: '42 hours', image: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?w=1000' },
  { id: 2, title: 'Python for Data Science', instructor: 'Dr. Alex Chen', progress: 42, rating: 4.8, duration: '36 hours', image: 'https://images.unsplash.com/photo-1762330910399-95caa55acf04?w=1000' },
  { id: 3, title: 'React Masterclass', instructor: 'Maria Garcia', progress: 100, rating: 4.9, duration: '28 hours', image: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?w=1000' },
  { id: 4, title: 'Machine Learning Fundamentals', instructor: 'Dr. James Wilson', progress: 28, rating: 4.7, duration: '45 hours', image: 'https://images.unsplash.com/photo-1688413709025-5f085266935a?w=1000' },
  { id: 5, title: 'Advanced JavaScript', instructor: 'Emily Davis', progress: 85, rating: 4.8, duration: '32 hours', image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1000' },
  { id: 6, title: 'Node.js Complete Guide', instructor: 'Michael Brown', progress: 100, rating: 4.9, duration: '38 hours', image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=1000' },
];

export default function StudentCourses({ navigate, logout, userRole }: StudentCoursesProps) {
  const [activeView, setActiveView] = React.useState<'all' | 'my'>('all');
  const [myCoursesTab, setMyCoursesTab] = React.useState<'in-progress' | 'completed'>('in-progress');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter courses based on search query
  const filteredCourses = React.useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.duration.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // helpers to render cards
  const renderAllCoursesCard = (course: typeof courses[0]) => (
    <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6 }} transition={{ duration: 0.28 }}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => navigate('course-details')}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-md font-medium">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Enroll Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderMyCoursesCard = (course: typeof courses[0]) => (
    <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6 }} transition={{ duration: 0.28 }}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => navigate('course-details')}>
        <ImageWithFallback src={course.image} alt={course.title} className="w-full h-48 object-cover" />
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 text-md font-medium">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>

          {course.progress === 100 ? (
            <div className="mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-100 to-cyan-100 rounded-lg py-2">
              <Play className="h-5 w-5 text-violet-600" />
              <span className="font-semibold text-violet-700">100% Complete</span>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-500" />
            </div>
          )}

          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
            <Play className="mr-2 h-4 w-4" />
            {course.progress === 100 ? 'Review' : 'Continue'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={[
            { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
            { icon: BookOpen, label: 'My Courses', page: 'student-courses', active: true },
            { icon: FileText, label: 'Assignments', page: 'student-assignments' },
            { icon: Award, label: 'Certificates', page: 'student-certificates' },
            { icon: Users, label: 'Community', page: 'community' },
            { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
            { icon: Code, label: 'Compiler', page: 'student-compiler' },
            { icon: Bell, label: 'Notifications', page: 'student-notifications' },
            { icon: User, label: 'Profile', page: 'student-profile' },
            { icon: Settings, label: 'Settings', page: 'student-settings' },
            { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
          ]}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-courses"
        />


        {/* Main content */}
        <div className="flex-1 lg:ml-0 w-full">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center gap-4 justify-between">
              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-2xl font-semibold">My Courses</h1>
                <p className="text-sm text-gray-600">Track your learning progress</p>
              </div>

              {/* Search & Icons */}
              <div className="flex items-center gap-4 w-full max-w-xl ml-6">
                {/* Search */}
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-0 focus:border-violet-300 transition"
                  />
                </div>

                {/* Header icons component */}
                <div className="hidden sm:flex">
                  <HeaderIcons navigate={navigate} logout={logout} userRole="student" />
                </div>
              </div>

              {/* Mobile header icons (small screens) */}
              <div className="flex items-center gap-2 lg:hidden">
                <HeaderIcons navigate={navigate} logout={logout} userRole="student" />
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="p-6 max-w-7xl mx-auto">
            {/* Segmented control - pill style */}
            <div className="mb-6">
              <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-sm" role="tablist" aria-label="Views">
                <button
                  onClick={() => setActiveView('all')}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${activeView === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setActiveView('my')}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-200 ${activeView === 'my' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  My Courses
                </button>
              </div>
            </div>

            {/* Content (All / My) */}
            {activeView === 'all' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map(renderAllCoursesCard)}
                </div>
              </motion.div>
            )}

            {activeView === 'my' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {/* inner tabs */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setMyCoursesTab('in-progress')}
                    className={`px-4 py-2 rounded-full text-sm ${myCoursesTab === 'in-progress' ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setMyCoursesTab('completed')}
                    className={`px-4 py-2 rounded-full text-sm ${myCoursesTab === 'completed' ? 'bg-violet-100 text-violet-700 border-2 border-violet-300' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    Completed
                  </button>
                </div>

                {myCoursesTab === 'in-progress' && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.filter(c => c.progress > 0 && c.progress < 100).map(renderMyCoursesCard)}
                  </div>
                )}

                {myCoursesTab === 'completed' && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.filter(c => c.progress === 100).map(renderMyCoursesCard)}
                  </div>
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
