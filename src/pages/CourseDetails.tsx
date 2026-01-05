import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Star, Users, Clock, Award, CheckCircle2, FileText, MessageSquare, Globe, Lock, ChevronRight, ChevronLeft, SkipForward, SkipBack, X, ArrowLeft, Download, BookOpen, Settings, Volume2, Maximize, Bookmark, Send, LayoutDashboard, Code, Map, Bell, User, Menu } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserRole } from '../App';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import HeaderIcons from '../components/HeaderIcons';

interface CourseDetailsProps {
  navigate: (page: string) => void;
  userRole: UserRole;
  logout?: () => void;
}

interface Lecture {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  description?: string;
  resources?: string[];
}

interface Section {
  title: string;
  lectures: Lecture[];
  duration: string;
}

interface Note {
  id: number;
  timestamp: string;
  content: string;
  videoTime: number;
}

export default function CourseDetails({ navigate, userRole, logout }: CourseDetailsProps) {
  // Simulating enrollment status - in real app, this would come from backend/localStorage
  const [isEnrolled, setIsEnrolled] = useState(userRole === 'student');
  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [completedLectures, setCompletedLectures] = useState<Set<number>>(new Set([1, 2]));
  const [activeTab, setActiveTab] = useState('overview');
  const [videoPlayerTab, setVideoPlayerTab] = useState('overview');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Define menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'student') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
        { icon: BookOpen, label: 'Courses', page: 'student-courses' },
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
    }
    return [];
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('home');
  };

  // Course sections with video data
  const courseSections: Section[] = [
    {
      title: 'Introduction to Web Development',
      duration: '1h 30m',
      lectures: [
        { 
          id: 1, 
          title: 'Welcome to the Course', 
          duration: '5:30', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
          completed: true,
          description: 'Get started with an introduction to the course structure, learning objectives, and what you can expect to achieve.',
          resources: ['Course Syllabus.pdf', 'Welcome Guide.pdf', 'Community Guidelines.pdf']
        },
        { 
          id: 2, 
          title: 'What is Web Development?', 
          duration: '12:45', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
          completed: true,
          description: 'Learn about the fundamentals of web development, frontend vs backend, and the modern web development landscape.',
          resources: ['Web Development Overview.pdf', 'Technology Stack Guide.pdf']
        },
        { 
          id: 3, 
          title: 'Setting Up Your Development Environment', 
          duration: '18:20', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
          completed: false,
          description: 'Step-by-step guide to installing and configuring your development tools, IDE, and essential software.',
          resources: ['VS Code Setup Guide.pdf', 'Essential Extensions.pdf', 'Terminal Basics.pdf']
        },
        { 
          id: 4, 
          title: 'Overview of Web Technologies', 
          duration: '15:10', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 
          completed: false,
          description: 'Explore the ecosystem of web technologies including HTML, CSS, JavaScript, and modern frameworks.',
          resources: ['Technology Roadmap.pdf', 'Quick Reference Guide.pdf']
        },
      ]
    },
    {
      title: 'HTML & CSS Fundamentals',
      duration: '2h 45m',
      lectures: [
        { 
          id: 5, 
          title: 'Introduction to HTML', 
          duration: '20:15', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 
          completed: false,
          description: 'Master the building blocks of web pages with HTML structure, semantic elements, and best practices.',
          resources: ['HTML Cheat Sheet.pdf', 'Semantic HTML Guide.pdf']
        },
        { 
          id: 6, 
          title: 'HTML Elements and Tags', 
          duration: '25:30', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
          completed: false,
          description: 'Deep dive into HTML elements, attributes, forms, tables, and multimedia integration.',
          resources: ['HTML Elements Reference.pdf', 'Form Building Guide.pdf']
        },
        { 
          id: 7, 
          title: 'CSS Basics and Selectors', 
          duration: '22:40', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 
          completed: false,
          description: 'Learn CSS fundamentals including selectors, specificity, and the cascade.',
          resources: ['CSS Selectors Guide.pdf', 'Specificity Calculator.pdf']
        },
        { 
          id: 8, 
          title: 'CSS Box Model', 
          duration: '18:45', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 
          completed: false,
          description: 'Understand the CSS box model, margins, padding, borders, and layout techniques.',
          resources: ['Box Model Visualization.pdf', 'Layout Examples.pdf']
        },
      ]
    },
    {
      title: 'JavaScript Basics',
      duration: '3h 20m',
      lectures: [
        { 
          id: 9, 
          title: 'Introduction to JavaScript', 
          duration: '16:20', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 
          completed: false,
          description: 'Get started with JavaScript programming, syntax, and core concepts.',
          resources: ['JavaScript Basics.pdf', 'Setup Guide.pdf']
        },
        { 
          id: 10, 
          title: 'Variables and Data Types', 
          duration: '24:15', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 
          completed: false,
          description: 'Learn about variables, data types, type conversion, and operators in JavaScript.',
          resources: ['Data Types Guide.pdf', 'Practice Exercises.pdf']
        },
        { 
          id: 11, 
          title: 'Functions and Scope', 
          duration: '28:30', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 
          completed: false,
          description: 'Master JavaScript functions, closures, scope, and execution context.',
          resources: ['Functions Deep Dive.pdf', 'Scope Examples.pdf']
        },
        { 
          id: 12, 
          title: 'Arrays and Objects', 
          duration: '26:45', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 
          completed: false,
          description: 'Work with JavaScript arrays, objects, and their built-in methods.',
          resources: ['Array Methods.pdf', 'Object Manipulation.pdf']
        },
      ]
    },
    {
      title: 'React Framework',
      duration: '4h 15m',
      lectures: [
        { 
          id: 13, 
          title: 'What is React?', 
          duration: '14:20', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 
          completed: false,
          description: 'Introduction to React, virtual DOM, and component-based architecture.',
          resources: ['React Overview.pdf', 'Getting Started.pdf']
        },
        { 
          id: 14, 
          title: 'Components and Props', 
          duration: '32:15', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
          completed: false,
          description: 'Build reusable components and pass data using props.',
          resources: ['Component Patterns.pdf', 'Props Guide.pdf']
        },
        { 
          id: 15, 
          title: 'State and Lifecycle', 
          duration: '35:40', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
          completed: false,
          description: 'Manage component state and understand React lifecycle methods.',
          resources: ['State Management.pdf', 'Lifecycle Diagram.pdf']
        },
        { 
          id: 16, 
          title: 'Hooks and Effects', 
          duration: '38:25', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
          completed: false,
          description: 'Master React Hooks including useState, useEffect, and custom hooks.',
          resources: ['Hooks API Reference.pdf', 'Custom Hooks.pdf']
        },
      ]
    },
    {
      title: 'Backend with Node.js',
      duration: '3h 50m',
      lectures: [
        { 
          id: 17, 
          title: 'Introduction to Node.js', 
          duration: '18:30', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 
          completed: false,
          description: 'Learn Node.js fundamentals, npm, and building server-side applications.',
          resources: ['Node.js Setup.pdf', 'NPM Guide.pdf']
        },
        { 
          id: 18, 
          title: 'Building REST APIs', 
          duration: '42:20', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 
          completed: false,
          description: 'Create RESTful APIs with Express.js and handle HTTP requests.',
          resources: ['REST API Design.pdf', 'Express Middleware.pdf']
        },
        { 
          id: 19, 
          title: 'Database Integration', 
          duration: '38:15', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 
          completed: false,
          description: 'Connect to databases, perform CRUD operations, and manage data.',
          resources: ['MongoDB Guide.pdf', 'SQL Basics.pdf']
        },
        { 
          id: 20, 
          title: 'Authentication & Security', 
          duration: '45:50', 
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 
          completed: false,
          description: 'Implement authentication, authorization, and security best practices.',
          resources: ['JWT Authentication.pdf', 'Security Checklist.pdf']
        },
      ]
    }
  ];

  // Flatten all lectures for navigation
  const allLectures = courseSections.flatMap(section => section.lectures);
  const totalLectures = allLectures.length;
  const completedCount = completedLectures.size;
  const progressPercentage = Math.round((completedCount / totalLectures) * 100);

  const handleEnroll = () => {
    if (userRole === 'guest') {
      toast.error('Please sign up or log in to enroll in this course');
      setTimeout(() => {
        navigate('signup');
      }, 1000);
    } else if (userRole === 'student') {
      setIsEnrolled(true);
      toast.success('Successfully enrolled in the course!');
    } else if (userRole === 'instructor') {
      toast.error('Instructors cannot enroll in courses. Please sign in with a student account.');
    } else if (userRole === 'admin') {
      toast.error('Admins cannot enroll in courses. Please sign in with a student account.');
    }
  };

  const handleLectureClick = (lecture: Lecture) => {
    if (!isEnrolled) {
      toast.error('Please enroll in this course to access the videos');
      return;
    }
    setSelectedVideo(lecture);
    setActiveTab('curriculum');
  };

  const handleMarkAsComplete = () => {
    if (selectedVideo) {
      setCompletedLectures(prev => new Set([...prev, selectedVideo.id]));
      toast.success('Lecture marked as complete!');
    }
  };

  const handleNextLecture = () => {
    if (!selectedVideo) return;
    const currentIndex = allLectures.findIndex(l => l.id === selectedVideo.id);
    if (currentIndex < allLectures.length - 1) {
      setSelectedVideo(allLectures[currentIndex + 1]);
    }
  };

  const handlePreviousLecture = () => {
    if (!selectedVideo) return;
    const currentIndex = allLectures.findIndex(l => l.id === selectedVideo.id);
    if (currentIndex > 0) {
      setSelectedVideo(allLectures[currentIndex - 1]);
    }
  };

  const handleBackToCourse = () => {
    setSelectedVideo(null);
    setVideoPlayerTab('overview');
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    toast.success(`Playback speed set to ${speed}x`);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !videoRef.current) return;
    
    const note: Note = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      content: newNote,
      videoTime: Math.floor(videoRef.current.currentTime)
    };
    
    setNotes([...notes, note]);
    setNewNote('');
    toast.success('Note added successfully!');
  };

  const handleDownloadResource = (resource: string) => {
    toast.success(`Downloading ${resource}...`);
    // In real app, this would trigger actual download
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLectureIndex = selectedVideo ? allLectures.findIndex(l => l.id === selectedVideo.id) : -1;
  const currentSection = selectedVideo ? courseSections.find(section => 
    section.lectures.some(lecture => lecture.id === selectedVideo.id)
  ) : null;

  // Show sidebar only for students
  const showSidebar = userRole === 'student';
  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar - Only for students */}
        {showSidebar && (
          <Sidebar
            menuItems={menuItems}
            navigate={navigate}
            logout={handleLogout}
            userRole={userRole as 'student'}
            activePage="student-courses"
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        )}

        <div className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''} w-full`}>
          {/* Header for students */}
          {showSidebar && (
            <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
              <div className="flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden flex-shrink-0"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl">Course Details</h1>
                  <p className="text-gray-600 text-sm md:text-base">Complete Web Development Bootcamp</p>
                </div>
                <HeaderIcons navigate={navigate} logout={handleLogout} userRole={userRole} />
              </div>
            </header>
          )}

          {/* Content */}
          <main className={`${showSidebar ? 'p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide' : ''}`}>

            {/* Navbar for non-students (guest, instructor, admin) */}
            {!showSidebar && <Navbar navigate={navigate} userRole={userRole} logout={logout} />}

            {/* Video Player Modal */}
            <AnimatePresence>
              {selectedVideo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/95 z-50 overflow-y-auto scrollbar-hide"
                >
                  <div className="min-h-screen py-4 px-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-7xl mx-auto"
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                        {/* Video Player Header with Back Button */}
                        <div className="bg-gradient-to-r from-violet-600 to-cyan-500 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Button
                              onClick={handleBackToCourse}
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back to Course
                            </Button>
                            <button
                              onClick={handleBackToCourse}
                              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Badge className="bg-white/20 text-white border-white/30 mb-2">
                                {currentSection?.title}
                              </Badge>
                              <h3 className="text-white text-2xl mb-1">{selectedVideo.title}</h3>
                              <p className="text-white/80 text-sm">
                                Lecture {currentLectureIndex + 1} of {totalLectures} • Duration: {selectedVideo.duration}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-white/80 text-sm mb-1">Course Progress</div>
                              <div className="text-white text-xl">{progressPercentage}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Video Player */}
                        <div className="bg-black relative">
                          <video
                            ref={videoRef}
                            key={selectedVideo.id}
                            className="w-full aspect-video"
                            controls
                            autoPlay
                            src={selectedVideo.videoUrl}
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                videoRef.current.playbackRate = playbackSpeed;
                              }
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>

                        {/* Video Content Tabs */}
                        <Tabs value={videoPlayerTab} onValueChange={setVideoPlayerTab} className="border-t">
                          <div className="border-b bg-gray-50">
                            <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                              <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Overview
                              </TabsTrigger>
                              <TabsTrigger value="resources" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <Download className="h-4 w-4 mr-2" />
                                Resources
                              </TabsTrigger>
                              <TabsTrigger value="notes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <FileText className="h-4 w-4 mr-2" />
                                Notes ({notes.length})
                              </TabsTrigger>
                              <TabsTrigger value="settings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          {/* Overview Tab */}
                          <TabsContent value="overview" className="p-6 m-0">
                            <div className="space-y-6">
                              {/* Quick Actions */}
                              <div className="flex items-center gap-3 flex-wrap">
                                {completedLectures.has(selectedVideo.id) ? (
                                  <Badge className="bg-green-500 px-4 py-2">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Button
                                    onClick={handleMarkAsComplete}
                                    className="bg-gradient-to-r from-violet-600 to-cyan-500"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Complete
                                  </Button>
                                )}
                                <Button variant="outline">
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  Bookmark
                                </Button>
                              </div>

                              {/* Lecture Description */}
                              <div>
                                <h4 className="text-lg mb-2">About This Lecture</h4>
                                <p className="text-gray-600">{selectedVideo.description}</p>
                              </div>

                              {/* Navigation */}
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  onClick={handlePreviousLecture}
                                  disabled={currentLectureIndex === 0}
                                  className="w-full"
                                >
                                  <ChevronLeft className="h-4 w-4 mr-1" />
                                  Previous Lecture
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleNextLecture}
                                  disabled={currentLectureIndex === allLectures.length - 1}
                                  className="w-full"
                                >
                                  Next Lecture
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>

                              {/* Up Next Preview */}
                              {currentLectureIndex < allLectures.length - 1 && (
                                <div>
                                  <h4 className="text-sm text-gray-600 mb-3">Up Next:</h4>
                                  <Card
                                    className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-violet-200"
                                    onClick={() => setSelectedVideo(allLectures[currentLectureIndex + 1])}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
                                          <Play className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="mb-1">{allLectures[currentLectureIndex + 1].title}</p>
                                          <p className="text-sm text-gray-500">{allLectures[currentLectureIndex + 1].duration}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}

                              {/* Progress Info */}
                              <Card className="bg-gradient-to-r from-violet-50 to-cyan-50 border-violet-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">Course Progress</span>
                                    <span className="text-sm text-violet-600">{progressPercentage}% Complete</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${progressPercentage}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-600 mt-2">
                                    {completedCount} of {totalLectures} lectures completed
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          {/* Resources Tab */}
                          <TabsContent value="resources" className="p-6 m-0">
                            <h4 className="text-lg mb-4">Downloadable Resources</h4>
                            {selectedVideo.resources && selectedVideo.resources.length > 0 ? (
                              <div className="space-y-2">
                                {selectedVideo.resources.map((resource, index) => (
                                  <Card
                                    key={index}
                                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                                    onClick={() => handleDownloadResource(resource)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-cyan-500 rounded flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-white" />
                                          </div>
                                          <div>
                                            <p className="text-sm">{resource}</p>
                                            <p className="text-xs text-gray-500">PDF Document</p>
                                          </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                          <Download className="h-4 w-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No resources available for this lecture</p>
                            )}
                          </TabsContent>

                          {/* Notes Tab */}
                          <TabsContent value="notes" className="p-6 m-0">
                            <h4 className="text-lg mb-4">My Notes</h4>
                            
                            {/* Add Note */}
                            <Card className="mb-4 border-violet-200">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note at current timestamp..."
                                    className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  />
                                  <Button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="w-full bg-gradient-to-r from-violet-600 to-cyan-500"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Add Note
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Notes List */}
                            {notes.length > 0 ? (
                              <div className="space-y-3">
                                {notes.map((note) => (
                                  <Card key={note.id} className="border-l-4 border-l-violet-600">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className="text-xs">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {formatTime(note.videoTime)}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{note.timestamp}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{note.content}</p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No notes yet. Add your first note!</p>
                            )}
                          </TabsContent>

                          {/* Settings Tab */}
                          <TabsContent value="settings" className="p-6 m-0">
                            <h4 className="text-lg mb-4">Video Settings</h4>
                            
                            {/* Playback Speed */}
                            <Card className="mb-4">
                              <CardContent className="p-4">
                                <h5 className="mb-3">Playback Speed</h5>
                                <div className="grid grid-cols-5 gap-2">
                                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                    <Button
                                      key={speed}
                                      variant={playbackSpeed === speed ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleSpeedChange(speed)}
                                      className={playbackSpeed === speed ? "bg-gradient-to-r from-violet-600 to-cyan-500" : ""}
                                    >
                                      {speed}x
                                    </Button>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Video Quality Info */}
                            <Card>
                              <CardContent className="p-4">
                                <h5 className="mb-3">Video Information</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Quality:</span>
                                    <span>Auto (720p)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Speed:</span>
                                    <span>{playbackSpeed}x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <span>{selectedVideo.duration}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="container mx-auto px-4 py-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4">Web Development</Badge>
              <h1 className="text-4xl mb-4">Complete Web Development Bootcamp</h1>
              <p className="text-xl text-gray-600 mb-6">
                Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (12,500 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>45,320 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>42 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>English</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">Created by <span className="text-cyan-600">Sarah Johnson</span></p>
              </div>

              {/* Progress Bar for Enrolled Students */}
              {isEnrolled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Your Progress</span>
                        <span className="text-sm text-violet-600">{progressPercentage}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2.5 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{completedCount} of {totalLectures} lectures completed</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">What you'll learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Build responsive websites with HTML, CSS, and JavaScript',
                        'Master React and modern frontend development',
                        'Create backend APIs with Node.js and Express',
                        'Work with databases like MongoDB and PostgreSQL',
                        'Deploy full-stack applications to the cloud',
                        'Implement authentication and authorization',
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">Requirements</h2>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Basic computer skills</li>
                      <li>No prior programming experience needed</li>
                      <li>A computer with internet connection</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">Course Curriculum</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {courseSections.map((section, sectionIndex) => (
                        <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                          <AccordionTrigger>
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{section.title}</span>
                              <span className="text-sm text-gray-600">{section.lectures.length} lectures • {section.duration}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {section.lectures.map((lecture) => (
                                <div
                                  key={lecture.id}
                                  className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 ${
                                    isEnrolled
                                      ? 'hover:bg-violet-50 cursor-pointer'
                                      : 'opacity-60'
                                  }`}
                                  onClick={() => handleLectureClick(lecture)}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    completedLectures.has(lecture.id)
                                      ? 'bg-green-500'
                                      : isEnrolled
                                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500'
                                      : 'bg-gray-300'
                                  }`}>
                                    {completedLectures.has(lecture.id) ? (
                                      <CheckCircle2 className="h-4 w-4 text-white" />
                                    ) : isEnrolled ? (
                                      <Play className="h-4 w-4 text-white" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm">{lecture.title}</p>
                                    <p className="text-xs text-gray-500">{lecture.duration}</p>
                                  </div>
                                  {completedLectures.has(lecture.id) && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200"
                        alt="Instructor"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-2xl mb-2">Sarah Johnson</h2>
                        <p className="text-gray-600 mb-4">Senior Full Stack Developer at Tech Corp</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-6">Student Reviews</h2>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span>John Doe</span>
                            <span className="text-sm text-gray-500">• 2 days ago</span>
                          </div>
                          <p className="text-gray-600">
                            Excellent course! Very comprehensive and well-structured. The instructor explains everything clearly.
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
              <Card>
                <CardContent className="p-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?w=600"
                    alt="Course"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    {isEnrolled ? (
                      <div className="space-y-3 mb-6">
                        <Badge className="w-full justify-center py-2 bg-green-500">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Enrolled
                        </Badge>
                        <Button
                          className="w-full bg-gradient-to-r from-violet-600 to-cyan-500"
                          onClick={() => {
                            if (allLectures.length > 0) {
                              handleLectureClick(allLectures[0]);
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button className="w-full mb-6 bg-gradient-to-r from-cyan-500 to-blue-600" onClick={handleEnroll}>
                          Enroll
                        </Button>
                      </>
                    )}

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Includes:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>42 hours on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>15 downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Access to community</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}