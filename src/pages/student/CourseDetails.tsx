// ============================================================
// CourseDetails.tsx — Course Details Page (Clean Version)
// Applies: Single Responsibility, DRY
// Note: This page supports guest/instructor/student roles
// ============================================================

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Star, Users, Clock, Award, CheckCircle2, FileText, MessageSquare,
  Globe, ChevronRight, ChevronLeft, X, ArrowLeft, BookOpen, Settings,
  Send, LayoutDashboard, Code, Bell, User, Menu, Trash2, MapIcon,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { UserRole } from "../../App";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";
import { toast } from "sonner";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import VideoQuestions from "../../components/course/VideoQuestions";
import { COURSE_CATEGORIES } from "../../constants/courseCategories";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourseById, fetchCourseVideos, fetchCourseVideosPreview,
  fetchMyCourses, enrollInCourse, fetchCourseProgress,
  fetchVideosProgress, fetchVideoNotes, addVideoNote,
  deleteNote, sendVideoProgress,
} from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface CourseDetailsProps {
  userRole: UserRole;
  logout?: () => void;
}

interface VideoProgress { id: number; is_completed: boolean; }
interface Lecture { id: number; title: string; duration: number; videoUrl?: string; completed: boolean; description?: string; }
interface Section { title: string; lectures: Lecture[]; duration: string; }
interface Note { id: number; timestamp: string; content: string; videoTime: number; }

// ─── Pure helpers ─────────────────────────────────────────────

const extractYoutubeId = (url?: string): string => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : "";
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTotalDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const applyVideosProgress = (sections: Section[], progress: VideoProgress[]): Section[] => {
  const progressMap = new Map(progress.map((p) => [p.id, p.is_completed]));
  return sections.map((section) => ({
    ...section,
    lectures: section.lectures.map((lecture) => ({ ...lecture, completed: progressMap.get(lecture.id) === true })),
  }));
};

// ─── Main Component ──────────────────────────────────────────

export default function CourseDetails({ userRole, logout }: CourseDetailsProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseId = Number(id);

  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [videoPlayerTab, setVideoPlayerTab] = useState("overview");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseSections, setCourseSections] = useState<Section[]>([]);
  const [totalDuration, setTotalDuration] = useState("0m");
  const [courseProgress, setCourseProgress] = useState(0);

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const allLectures = courseSections.flatMap((s) => s.lectures);
  const totalLectures = allLectures.length;
  const currentLectureIndex = selectedVideo ? allLectures.findIndex((l) => l.id === selectedVideo.id) : -1;
  const currentSection = selectedVideo ? courseSections.find((s) => s.lectures.some((l) => l.id === selectedVideo.id)) : null;
  const showSidebar = userRole === "student";

  // ─── Load YouTube API ──────────────────────────────────────
  useEffect(() => {
    if ((window as any).YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // ─── Load Course Data ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const courseData: any = await fetchCourseById(courseId);
        setCourse(courseData);

        const myCourses: any = await fetchMyCourses().catch(() => []);
        const enrolled = Array.isArray(myCourses) && myCourses.some((c: any) => c.id === courseId);
        setIsEnrolled(enrolled);

        await loadCourseVideos(enrolled);

        const vProgress: any = await fetchVideosProgress(courseId).catch(() => []);
        setCourseSections((prev) => applyVideosProgress(prev, vProgress));

        const progress: any = await fetchCourseProgress(courseId).catch(() => null);
        if (progress) setCourseProgress(progress.progress_percentage);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId && !isNaN(courseId)) load();
  }, [id]);

  const loadCourseVideos = async (enrolled: boolean) => {
    try {
      const videos: any = enrolled
        ? await fetchCourseVideos(courseId)
        : await fetchCourseVideosPreview(courseId);

      const totalSeconds = videos.reduce((sum: number, v: any) => sum + (Number(v.duration) || 0), 0);
      setTotalDuration(formatTotalDuration(totalSeconds));

      setCourseSections([{
        title: "Course Content",
        duration: formatTotalDuration(totalSeconds),
        lectures: videos.map((v: any) => ({
          id: v.id, title: v.title,
          duration: Number(v.duration) || 0,
          videoUrl: enrolled ? v.video_url : undefined,
          completed: false,
          description: v.description ?? "",
        })),
      }]);
    } catch (err) {
      console.error(err);
      setCourseSections([]);
    }
  };

  // ─── YouTube Player ────────────────────────────────────────
  useEffect(() => {
    if (!selectedVideo) return;

    loadNotes(selectedVideo.id);

    if (!(window as any).YT) return;
    const YT = (window as any).YT;

    playerRef.current = new YT.Player("youtube-player", {
      videoId: extractYoutubeId(selectedVideo.videoUrl),
      events: {
        onStateChange: (event: any) => {
          if (event.data === YT.PlayerState.PLAYING) startTracking();
          if (event.data === YT.PlayerState.PAUSED) { stopTracking(); sendProgress(); }
          if (event.data === YT.PlayerState.ENDED) stopTracking();
        },
      },
    });

    return () => { stopTracking(); playerRef.current?.destroy(); };
  }, [selectedVideo]);

  const startTracking = () => {
    stopTracking();
    progressIntervalRef.current = setInterval(sendProgress, 5000);
  };

  const stopTracking = () => {
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
  };

  const sendProgress = async () => {
    if (!playerRef.current || !selectedVideo || selectedVideo.completed) return;
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    if (currentTime <= 0) return;

    try {
      const data: any = await sendVideoProgress(selectedVideo.id, currentTime);
      if (data.video?.completed) {
        setCourseSections((prev) =>
          prev.map((section) => ({ ...section, lectures: section.lectures.map((l) => l.id === selectedVideo.id ? { ...l, completed: true } : l) }))
        );
      }
      const progress: any = await fetchCourseProgress(courseId).catch(() => null);
      if (progress) setCourseProgress(progress.progress_percentage);
    } catch (err) { console.error(err); }
  };

  // ─── Notes ────────────────────────────────────────────────
  const loadNotes = async (videoId: number) => {
    try {
      const data: any = await fetchVideoNotes(videoId);
      setNotes(data.map((n: any) => ({ id: n.id, content: n.content, timestamp: new Date(n.updated_at ?? n.created_at).toLocaleString(), videoTime: n.video_timestamp ?? 0 })));
    } catch (err) { console.error(err); }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedVideo || !playerRef.current) return;
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    try {
      const data: any = await addVideoNote(selectedVideo.id, newNote, currentTime);
      setNotes((prev) => [...prev, { id: data.id, content: data.content, timestamp: new Date(data.created_at).toLocaleString(), videoTime: data.video_timestamp ?? 0 }]);
      setNewNote("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch { toast.error("Failed to delete note"); }
  };

  const seekToTime = (time: number) => { if (playerRef.current) playerRef.current.seekTo(time, true); };

  // ─── Handlers ─────────────────────────────────────────────
  const handleEnroll = async () => {
    if (userRole === "guest") { toast.error("Please sign up or log in to enroll"); setTimeout(() => navigate("/signup"), 1000); return; }
    if (userRole === "instructor") { toast.error("Instructors cannot enroll in courses"); return; }
    try {
      await enrollInCourse(courseId);
      setIsEnrolled(true);
      await loadCourseVideos(true);
      toast.success("Successfully enrolled in the course!");
    } catch { toast.error("Enrollment failed"); }
  };

  const handleLectureClick = (lecture: Lecture) => {
    if (!isEnrolled) { toast.error("Please enroll in this course to access the videos"); return; }
    setSelectedVideo(lecture);
    setActiveTab("curriculum");
  };

  if (!courseId || isNaN(courseId)) return <div className="p-10 text-center text-gray-600">No course selected</div>;
  if (loading) return <div className="p-10 text-center">Loading course...</div>;

  const menuItems = showSidebar ? getStudentMenuItems("/student/courses") : [];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {showSidebar && (
          <Sidebar menuItems={menuItems} logout={() => logout?.()} userRole="student" activePage="/student/courses" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        )}

        <div className={`flex-1 ${showSidebar ? "lg:ml-0" : ""} w-full`}>
          {showSidebar && (
            <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
              <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/student/courses")} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl">Course Details</h1>
                  <p className="text-gray-600 text-sm md:text-base">{course?.title}</p>
                </div>
                <HeaderIcons logout={() => logout?.()} userRole={userRole} />
              </div>
            </header>
          )}

          <main className={showSidebar ? "p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide" : ""}>
            {!showSidebar && <Navbar userRole={userRole} logout={logout} />}

            {/* Video Player Modal */}
            <AnimatePresence>
              {selectedVideo && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 overflow-y-auto scrollbar-hide">
                  <div className="min-h-screen py-4 px-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-7xl mx-auto">
                      <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-cyan-500 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Button onClick={() => { setSelectedVideo(null); setVideoPlayerTab("overview"); }} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                              <ArrowLeft className="h-4 w-4 mr-2" />Back to Course
                            </Button>
                            <button onClick={() => { setSelectedVideo(null); setVideoPlayerTab("overview"); }} className="text-white hover:bg-white/20 p-2 rounded-full">
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Badge className="bg-white/20 text-white border-white/30 mb-2">{currentSection?.title}</Badge>
                              <h3 className="text-white text-2xl mb-1">{selectedVideo.title}</h3>
                              <p className="text-white/80 text-sm">Lecture {currentLectureIndex + 1} of {totalLectures} • Duration: {formatDuration(selectedVideo.duration)}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-white/80 text-sm mb-1">Course Progress</div>
                              <div className="text-white text-xl">{courseProgress}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Player */}
                        <div className="bg-black">
                          <div className="w-full aspect-video">
                            {selectedVideo.videoUrl ? <div id="youtube-player" className="w-full h-full" /> : <p className="text-white text-sm p-4">Video not found</p>}
                          </div>
                        </div>

                        {/* Tabs */}
                        <Tabs value={videoPlayerTab} onValueChange={setVideoPlayerTab} className="border-t">
                          <div className="border-b bg-gray-50">
                            <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                              {[{ value: "overview", icon: <BookOpen className="h-4 w-4 mr-2" />, label: "Overview" }, { value: "questions", icon: <MessageSquare className="h-4 w-4 mr-2" />, label: "Questions" }, { value: "notes", icon: <FileText className="h-4 w-4 mr-2" />, label: `Notes (${notes.length})` }].map(({ value, icon, label }) => (
                                <TabsTrigger key={value} value={value} className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-violet-600">{icon}{label}</TabsTrigger>
                              ))}
                            </TabsList>
                          </div>

                          <TabsContent value="overview" className="p-6 m-0">
                            {allLectures[currentLectureIndex]?.description && (
                              <Card className="bg-gray-50 border-gray-200 mb-4">
                                <CardContent className="p-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Lecture Overview</h4>
                                  <p className="text-sm text-gray-600">{allLectures[currentLectureIndex].description}</p>
                                </CardContent>
                              </Card>
                            )}
                            <div className="space-y-6">
                              <Badge className="bg-blue-500 px-4 py-2">Watching</Badge>
                              <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => { const i = allLectures.findIndex((l) => l.id === selectedVideo.id); if (i > 0) setSelectedVideo(allLectures[i - 1]); }} disabled={currentLectureIndex === 0} className="w-full">
                                  <ChevronLeft className="h-4 w-4 mr-1" />Previous Lecture
                                </Button>
                                <Button variant="outline" onClick={() => { const i = allLectures.findIndex((l) => l.id === selectedVideo.id); if (i < allLectures.length - 1) setSelectedVideo(allLectures[i + 1]); }} disabled={currentLectureIndex === allLectures.length - 1} className="w-full">
                                  Next Lecture<ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                              {currentLectureIndex < allLectures.length - 1 && (
                                <Card className="cursor-pointer hover:shadow-md border-violet-200" onClick={() => setSelectedVideo(allLectures[currentLectureIndex + 1])}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-cyan-500 rounded flex items-center justify-center flex-shrink-0"><Play className="h-5 w-5 text-white" /></div>
                                      <div><p className="mb-1">{allLectures[currentLectureIndex + 1].title}</p><p className="text-sm text-gray-500">{formatDuration(allLectures[currentLectureIndex + 1].duration)}</p></div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                              <Card className="bg-gradient-to-r from-violet-50 to-cyan-50 border-violet-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2"><span className="text-sm">Course Progress</span><span className="text-sm text-violet-600">{courseProgress}% Complete</span></div>
                                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2 rounded-full transition-all duration-300" style={{ width: `${courseProgress}%` }} /></div>
                                  <p className="text-xs text-gray-600 mt-2">Progress is calculated automatically</p>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="questions" className="p-6 m-0">
                            <VideoQuestions videoId={selectedVideo.id} />
                          </TabsContent>

                          <TabsContent value="notes" className="p-6 m-0">
                            <h4 className="text-lg mb-4">My Notes</h4>
                            <Card className="mb-4 border-violet-200">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note at current timestamp..." className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
                                  <Button onClick={handleAddNote} disabled={!newNote.trim()} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500"><Send className="h-4 w-4 mr-2" />Add Note</Button>
                                </div>
                              </CardContent>
                            </Card>
                            {notes.length > 0 ? (
                              <div className="space-y-3">
                                {notes.map((note) => (
                                  <Card key={note.id} className="border-l-4 border-l-violet-600">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-2">
                                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-violet-100" onClick={() => seekToTime(note.videoTime)}>
                                          <Clock className="h-3 w-3 mr-1" />{formatDuration(note.videoTime)}
                                        </Badge>
                                        <Trash2 className="h-4 w-4 text-red-500 cursor-pointer hover:scale-110 transition" onClick={() => handleDeleteNote(note.id)} />
                                      </div>
                                      <p className="text-sm text-gray-700">{note.content}</p>
                                      <p className="text-xs text-gray-400 mt-2">{note.timestamp}</p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : <p className="text-gray-500 text-center py-8">No notes yet. Add your first note!</p>}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Course Content */}
            <div className="container mx-auto px-4 py-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex gap-2 items-center mb-4">
                      <Badge>{COURSE_CATEGORIES[course.category] ?? course.category}</Badge>
                      <Badge variant="outline" className="capitalize">{course.level}</Badge>
                    </div>
                    <h1 className="text-4xl mb-4">{course?.title}</h1>
                    <p className="text-xl text-gray-600 mb-6">{course?.description}</p>
                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>Students enrolled</span></div>
                      <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{totalDuration}</span></div>
                      <div className="flex items-center gap-2"><Globe className="h-5 w-5" /><span>English</span></div>
                    </div>
                    <p className="text-gray-600 mb-6">Created by <span className="text-cyan-600">{course?.instructor_name}</span></p>

                    {isEnrolled && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-cyan-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2"><span className="text-sm">Your Progress</span><span className="text-sm text-violet-600">{courseProgress}% Complete</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${courseProgress}%` }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2.5 rounded-full" />
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
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <Card><CardContent className="p-6">
                        <h2 className="text-2xl mb-4">What you'll learn</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {course?.outcomes?.length > 0 ? course.outcomes.map((item: string, i: number) => (
                            <div key={i} className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" /><span>{item}</span></div>
                          )) : <p className="text-gray-500">No learning outcomes available.</p>}
                        </div>
                      </CardContent></Card>
                      <Card className="mt-6"><CardContent className="p-6">
                        <h2 className="text-2xl mb-4">Requirements</h2>
                        <ul className="space-y-2 list-disc list-inside">
                          {course?.requirements?.length > 0 ? course.requirements.map((req: string, i: number) => <li key={i}>{req}</li>) : <li className="text-gray-500 list-none">No requirements available.</li>}
                        </ul>
                      </CardContent></Card>
                    </TabsContent>

                    <TabsContent value="curriculum" className="mt-6">
                      <Card><CardContent className="p-6">
                        <h2 className="text-2xl mb-4">Course Curriculum</h2>
                        <Accordion type="single" collapsible className="w-full">
                          {courseSections.map((section, sectionIndex) => (
                            <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                              <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4"><span>{section.title}</span><span className="text-sm text-gray-600">{section.lectures.length} lectures • {section.duration}</span></div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {section.lectures.map((lecture) => (
                                    <div key={lecture.id} className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 ${isEnrolled ? "hover:bg-violet-50 cursor-pointer" : "opacity-60"}`} onClick={() => handleLectureClick(lecture)}>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${lecture.completed ? "bg-green-500" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}>
                                        {lecture.completed ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm">{lecture.title}</p>
                                        <p className="text-xs text-gray-500">{formatDuration(lecture.duration)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent></Card>
                    </TabsContent>

                    <TabsContent value="instructor" className="mt-6">
                      <Card><CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <ImageWithFallback
                            src={course?.instructor_image}
                            alt="Instructor"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <div><h2 className="text-2xl mb-2">{course?.instructor_name}</h2><p className="text-gray-600">Course Instructor</p></div>
                        </div>
                      </CardContent></Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar Card */}
                <div className="lg:col-span-1">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                    <Card>
                      <CardContent className="p-0">
                        <ImageWithFallback src={course?.thumbnail} alt="Course" className="w-full h-48 object-cover rounded-t-lg" />
                        <div className="p-6">
                          {isEnrolled ? (
                            <div className="space-y-3 mb-6">
                              <Badge className="w-full justify-center py-2 bg-green-500"><CheckCircle2 className="h-4 w-4 mr-1" />Enrolled</Badge>
                              <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500" onClick={() => { if (allLectures.length > 0) handleLectureClick(allLectures[0]); }}>
                                <Play className="h-4 w-4 mr-2" />Start Learning
                              </Button>
                            </div>
                          ) : (
                            <Button className="w-full mb-6 bg-gradient-to-r from-cyan-500 to-blue-600" onClick={handleEnroll}>
                              {userRole === "instructor" ? "Sign up as Student to Enroll" : "Enroll"}
                            </Button>
                          )}
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{totalDuration} on-demand video</span></div>
                            <div className="flex items-center gap-2"><Award className="h-4 w-4" /><span>Certificate of completion</span></div>
                            <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /><span>Access to community</span></div>
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