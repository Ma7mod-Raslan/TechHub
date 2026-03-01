import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Star, Users, Clock, Award, CheckCircle2, FileText, MessageSquare, Globe, Lock, ChevronRight, ChevronLeft, SkipForward, SkipBack, X, ArrowLeft, Download, BookOpen, Settings, Volume2, Maximize, Bookmark, Send, LayoutDashboard, Code, Map as mapIcon, Bell, User, Menu, Trash2, MapIcon } from 'lucide-react';
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
import VideoQuestions from '../components/course/VideoQuestions';
import { COURSE_CATEGORIES } from '../constants/courseCategories';


interface CourseDetailsProps {
  navigate: (page: string, role?: UserRole, state?: any) => void;
  userRole: UserRole;
  logout?: () => void;
  navigationState?: {
    courseId?: number;
  };
}

interface VideoProgress {
  id: number;
  is_completed: boolean;
}




interface Lecture {
  id: number;
  title: string;
  duration: number;
  videoUrl?: string;
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

export default function CourseDetails({
  navigate,
  userRole,
  logout,
  navigationState,
}: CourseDetailsProps) {

  // Simulating enrollment status - in real app, this would come from backend/localStorage
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [videoPlayerTab, setVideoPlayerTab] = useState('overview');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const id = navigationState?.courseId;
  const [courseSections, setCourseSections] = useState<Section[]>([]);
  const [totalDuration, setTotalDuration] = useState<string>('0m');
  const allLectures = courseSections.flatMap(section => section.lectures);
  const totalLectures = allLectures.length;
  const [courseProgress, setCourseProgress] = useState(0);









  // Define menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'student') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
        { icon: BookOpen, label: 'Courses', page: 'student-courses' },
        { icon: FileText, label: 'Assignments', page: 'student-assignments' },
        { icon: Award, label: 'Certificates', page: 'student-certificates' },
        { icon: Users, label: 'Community', page: 'community' },
        { icon: MapIcon, label: 'Roadmaps', page: 'student-roadmaps' },
        { icon: Code, label: 'Compiler', page: 'student-compiler' },
        { icon: Bell, label: 'Notifications', page: 'student-notifications' },
        { icon: User, label: 'Profile', page: 'student-profile' },
        { icon: Settings, label: 'Settings', page: 'student-settings' },
        { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
      ];
    }
    return [];
  };

  console.log(course);

  const extractYoutubeId = (url?: string) => {
    if (!url) return "";
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/
    );
    return match ? match[1] : "";
  };


  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const formatTotalDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "—";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  const fetchCourseVideos = async (enrolled: boolean) => {
    try {
      const endpoint = enrolled
        ? `http://localhost:3000/api/courses/${id}/videos`
        : `http://localhost:3000/api/courses/${id}/videos-preview`;

      const headers: any = {};
      if (enrolled) {
        headers.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
      }

      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        setCourseSections([]);
        return;
      }

      const videos = await res.json();
      const totalSeconds = videos.reduce(
        (sum: number, video: any) => sum + (Number(video.duration) || 0),
        0
      );
      setTotalDuration(formatTotalDuration(totalSeconds));

      const section: Section = {
        title: "Course Content",
        duration: formatTotalDuration(totalSeconds),
        lectures: videos.map((video: any) => ({
          id: video.id,
          title: video.title,
          duration: Number(video.duration) || 0,
          videoUrl: enrolled ? video.video_url : undefined,
          completed: false,
          description: video.description ?? "",
          resources: [],
        })),
      };

      setCourseSections([section]);
    } catch (err) {
      console.error(err);
    }
  };


  const checkEnrollment = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/me/my-courses",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!res.ok) return false;

      const courses = await res.json();
      return courses.some((c: any) => c.id === id);
    } catch {
      return false;
    }
  };


  useEffect(() => {
    if ((window as any).YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);


  // Flatten all lectures for navigation
  useEffect(() => {
    const load = async () => {
      try {
        const courseRes = await fetch(
          `http://localhost:3000/api/courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const courseData = await courseRes.json();
        setCourse(courseData);

        const enrolled = await checkEnrollment();
        setIsEnrolled(enrolled);

        await fetchCourseVideos(enrolled);

        const videosProgress = await fetchVideosProgress();

        setCourseSections(prev =>
          applyVideosProgress(prev, videosProgress)
        );

        await fetchCourseProgress();


      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);




  const handleEnroll = async () => {
    if (userRole === 'guest') {
      toast.error('Please sign up or log in to enroll in this course');
      setTimeout(() => {
        navigate('signup');
      }, 1000);
    } else if (userRole === 'student') {
      try {

        await fetch(`http://localhost:3000/api/courses/${id}/enroll`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        setIsEnrolled(true);
        await fetchCourseVideos(true);

        toast.success("Successfully enrolled in the course!");
      } catch {
        toast.error("Enrollment failed");
      }
    }

  };

  const fetchCourseProgress = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/courses/${id}/progress`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      setCourseProgress(data.progress_percentage);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideosProgress = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/courses/${id}/videos/progress`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!res.ok) return [];

      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const applyVideosProgress = (
    sections: Section[],
    progress: VideoProgress[]
  ) => {
    const progressMap = new Map(
      progress.map(p => [p.id, p.is_completed])
    );

    return sections.map(section => ({
      ...section,
      lectures: section.lectures.map(lecture => ({
        ...lecture,
        completed: progressMap.get(lecture.id) === true,
      })),
    }));
  };





  const handleLectureClick = (lecture: Lecture) => {
    if (!isEnrolled) {
      toast.error('Please enroll in this course to access the videos');
      return;
    }
    setSelectedVideo(lecture);
    setActiveTab('curriculum');
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

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedVideo || !playerRef.current) return;

    const currentTime = Math.floor(playerRef.current.getCurrentTime());

    try {
      const res = await fetch(
        `http://localhost:3000/api/videos/${selectedVideo.id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            content: newNote,
            video_timestamp: currentTime,
          }),
        }
      );

      const data = await res.json();

      setNotes(prev => [
        ...prev,
        {
          id: data.id,
          content: data.content,
          timestamp: new Date(data.created_at).toLocaleString(),
          videoTime: data.video_timestamp ?? 0,
        },
      ]);

      setNewNote('');
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };



  const deleteNote = async (noteId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    try {
      await fetch(
        `http://localhost:3000/api/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const seekToTime = (time: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
  };









  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchVideoNotes = async (videoId: number) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/videos/${videoId}/notes`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!res.ok) return;

      const data = await res.json();

      setNotes(
        data.map((note: any) => ({
          id: note.id,
          content: note.content,
          timestamp: new Date(
            note.updated_at ?? note.created_at
          ).toLocaleString(),
          videoTime: note.video_timestamp ?? 0,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };



  const currentLectureIndex = selectedVideo ? allLectures.findIndex(l => l.id === selectedVideo.id) : -1;
  const currentSection = selectedVideo ? courseSections.find(section =>
    section.lectures.some(lecture => lecture.id === selectedVideo.id)
  ) : null;



  // Show sidebar only for students
  const showSidebar = userRole === 'student';
  const menuItems = getMenuItems();

  useEffect(() => {
    if (!selectedVideo) return;
    fetchVideoNotes(selectedVideo.id);

    if (!(window as any).YT) return;

    const YT = (window as any).YT;

    playerRef.current = new YT.Player("youtube-player", {
      videoId: extractYoutubeId(selectedVideo.videoUrl),
      events: {
        onStateChange: (event: any) => {
          if (event.data === YT.PlayerState.PLAYING) {
            startTracking();
          }

          if (event.data === YT.PlayerState.PAUSED) {
            stopTracking();
            sendProgress();
          }

          if (event.data === YT.PlayerState.ENDED) {
            stopTracking();
          }

        },
      },
    });

    return () => {
      stopTracking();
      playerRef.current?.destroy();
    };
  }, [selectedVideo]);


  const startTracking = () => {
    stopTracking();

    progressIntervalRef.current = setInterval(() => {
      sendProgress();
    }, 5000);
  };

  const stopTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const sendProgress = async () => {
    if (!playerRef.current || !selectedVideo) return;
    if (selectedVideo.completed) return;

    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    if (currentTime <= 0) return;

    const res = await fetch(
      `http://localhost:3000/api/videos/${selectedVideo.id}/progress`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          current_time: currentTime,
        }),
      }
    );

    const data = await res.json();
    console.log("progress response:", data);

    if (data.video?.completed) {
      setCourseSections(prev =>
        prev.map(section => ({
          ...section,
          lectures: section.lectures.map(lecture =>
            lecture.id === selectedVideo.id
              ? { ...lecture, completed: true }
              : lecture
          ),
        }))
      );
    }

    fetchCourseProgress();
  };




  if (!id) {
    return (
      <div className="p-10 text-center text-gray-600">
        No course selected
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading course...
      </div>
    );
  }



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
                  onClick={() => navigate('student-courses')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

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
                  <p className="text-gray-600 text-sm md:text-base">{course?.title}</p>
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
                                Lecture {currentLectureIndex + 1} of {totalLectures} • Duration: {formatDuration(selectedVideo.duration)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-white/80 text-sm mb-1">Course Progress</div>
                              <div className="text-white text-xl">{courseProgress}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Video Player */}
                        <div className="bg-black relative">
                          <div className="w-full aspect-video">
                            {selectedVideo?.videoUrl ? (
                              <div id="youtube-player" className="w-full h-full" />
                            ) : (
                              <p className="text-white text-sm">Not Found</p>
                            )}

                          </div>

                        </div>

                        {/* Video Content Tabs */}
                        <Tabs value={videoPlayerTab} onValueChange={setVideoPlayerTab} className="border-t ">
                          <div className="border-b bg-gray-50 ">
                            <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                              <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Overview
                              </TabsTrigger>
                              <TabsTrigger
                                value="questions"
                                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Questions
                              </TabsTrigger>
                              <TabsTrigger value="notes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">
                                <FileText className="h-4 w-4 mr-2" />
                                Notes ({notes.length})
                              </TabsTrigger>
                            </TabsList>
                          </div>

                          {/* Overview Tab */}
                          <TabsContent value="overview" className="p-6 m-0">
                            {/* Lecture Description */}
                            {allLectures[currentLectureIndex]?.description && (
                              <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="p-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                    Lecture Overview
                                  </h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {allLectures[currentLectureIndex].description}
                                  </p>
                                </CardContent>
                              </Card>
                            )}

                            <div className="space-y-6">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className="bg-blue-500 px-4 py-2">
                                  Watching
                                </Badge>
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
                                          <p className="text-sm text-gray-500">{formatDuration(allLectures[currentLectureIndex + 1].duration)}</p>
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
                                    <span className="text-sm text-violet-600">{courseProgress}% Complete</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${courseProgress}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-600 mt-2">
                                    Progress is calculated automatically
                                  </p>

                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="questions" className="p-6 m-0">
                            <VideoQuestions videoId={selectedVideo.id} />
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
                                  <Card
                                    key={note.id}
                                    className="border-l-4 border-l-violet-600"
                                  >
                                    <CardContent className="p-4">
                                      {/* Header */}
                                      <div className="flex items-start justify-between mb-2">
                                        {/* Timestamp (Clickable) */}
                                        <Badge
                                          variant="outline"
                                          className="text-xs cursor-pointer hover:bg-violet-100"
                                          onClick={() => seekToTime(note.videoTime)}
                                        >
                                          <Clock className="h-3 w-3 mr-1" />
                                          {formatDuration(note.videoTime)}
                                        </Badge>

                                        {/* Delete Icon */}
                                        <Trash2
                                          className="h-4 w-4 text-red-500 cursor-pointer hover:scale-110 transition"
                                          onClick={() => deleteNote(note.id)}
                                        />
                                      </div>

                                      {/* Content */}
                                      <p className="text-sm text-gray-700">
                                        {note.content}
                                      </p>

                                      {/* Date */}
                                      <p className="text-xs text-gray-400 mt-2">
                                        {note.timestamp}
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}

                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-8">No notes yet. Add your first note!</p>
                            )}
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
                    <div className="flex gap-2 items-center">
                      <Badge >
                        {COURSE_CATEGORIES[course.category] ?? course.category}
                      </Badge>

                      <Badge variant="outline" className="capitalize">
                        {course.level}
                      </Badge>
                    </div>

                    <h1 className="text-4xl mb-4">
                      {course?.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                      {course?.description}
                    </p>


                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        {/* <span>4.9 (12,500 ratings)</span> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>45,320 students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span>{totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <span>English</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-600">
                        Created by{" "}
                        <span className="text-cyan-600">
                          {course?.instructor_name}
                        </span>
                      </p>                    </div>

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
                              <span className="text-sm text-violet-600">{courseProgress}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${courseProgress}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2.5 rounded-full"
                              />
                            </div>
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
                            {course?.outcomes && course.outcomes.length > 0 ? (
                              course?.outcomes?.map((item: string, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No learning outcomes available.</p>
                            )}

                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mt-6">
                        <CardContent className="p-6">
                          <h2 className="text-2xl mb-4">Requirements</h2>

                          <ul className="space-y-2 list-disc list-inside">
                            {course?.requirements && course.requirements.length > 0 ? (
                              course?.requirements?.map((req: string, index: number) => (
                                <li key={index}>{req}</li>
                              ))
                            ) : (
                              <li className="text-gray-500 list-none">
                                No requirements available.
                              </li>
                            )}
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
                                        className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 ${isEnrolled ? 'hover:bg-violet-50 cursor-pointer' : 'opacity-60'
                                          }`}
                                        onClick={() => handleLectureClick(lecture)}
                                      >
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                          ${lecture.completed ? "bg-green-500" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                                        >
                                          {lecture.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                          ) : (
                                            <Play className="h-4 w-4 text-white" />
                                          )}
                                        </div>


                                        <div className="flex-1">
                                          <p className="text-sm">{lecture.title}</p>
                                          <p className="text-xs text-gray-500">
                                            {formatDuration(lecture.duration)}
                                          </p>
                                        </div>
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
                              <h2 className="text-2xl mb-2"> {course?.instructor_name} </h2>
                              <p className="text-gray-600 mb-4">Course Instructor</p>
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
                          src={course?.thumbnail}
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
                              <span>{totalDuration} on-demand video</span>
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