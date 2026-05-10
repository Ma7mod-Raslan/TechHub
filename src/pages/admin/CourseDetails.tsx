// ============================================================
// CourseDetails.tsx — Admin Course Details (Clean Version)
// Applies: Single Responsibility, DRY, Open/Closed
// ============================================================

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, PlayCircle, Clock, Users, User, BookOpen, CheckCircle2,
  CheckCircle, Ban, Trash2, Menu,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchCourseDetails, toggleCourseStatus, deleteCourse } from "../admin/config/adminApi";
import { getAdminMenuItems } from "../admin/config/adminMenu";
import { COURSE_CATEGORIES } from "../../constants/courseCategories";

interface AdminCourseDetailsProps {
  logout: () => void;
  userRole: string;
}

interface Lecture {
  id: number;
  title: string;
  duration: string;
  videoUrl: string;
  description?: string;
  quizQuestions?: QuizQuestion[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; text: string; isCorrect: boolean }[];
}

interface Section {
  title: string;
  lectures: Lecture[];
  duration: string;
}

// ─── Pure helpers ─────────────────────────────────────────────

const extractYoutubeId = (url: string): string => {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : "";
};

const minutesToHumanDuration = (minutes: number): string =>
  `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

// ─── Main Component ──────────────────────────────────────────

export default function AdminCourseDetails({ logout }: AdminCourseDetailsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId ?? localStorage.getItem("selectedCourseId");

  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [courseSections, setCourseSections] = useState<Section[]>([]);
  const [courseStatus, setCourseStatus] = useState<"Active" | "Suspended">("Active");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [deleteQuestionConfirm, setDeleteQuestionConfirm] = useState<{ show: boolean; questionId: number | null; lectureId: number | null }>({ show: false, questionId: null, lectureId: null });

  useEffect(() => {
    if (!courseId) return;
    fetchCourseDetails(courseId)
      .then((data: any) => {
        const totalMinutes = Math.floor(data.total_duration / 60);

        setCourseData({
          id: data.id,
          courseName: data.course_name ?? data.name,
          instructor: data.instructor_name,
          category: COURSE_CATEGORIES[data.category] ?? data.category,
          enrolledStudents: data.enrolled_students ?? 0,
          description: data.description,
          thumbnail: data.thumbnail,
          rating: data.rating ?? 0,
          level: data.level,
          lastUpdated: data.updated_at,
          outcomes: data.outcomes ?? [],
          requirements: data.requirements ?? [],
        });

        setCourseStatus(data.status === "active" ? "Active" : "Suspended");

        const sections: Section[] = [{
          title: "Course Content",
          duration: minutesToHumanDuration(totalMinutes),
          lectures: data.videos.map((v: any) => ({
            id: v.id, title: v.title,
            duration: `${v.duration} min`,
            videoUrl: `/api/${v.video_url}`,
            description: v.description,
            quizQuestions: v.quizQuestions ?? [],
          })),
        }];

        setCourseSections(sections);
        if (sections[0]?.lectures?.length > 0) setSelectedVideo(sections[0].lectures[0]);
      })
      .catch(console.error);
  }, [courseId]);

  const totalLectures = courseSections.reduce((acc, s) => acc + s.lectures.length, 0);
  const totalDuration = courseSections.reduce((acc, s) => {
    const [h, m] = s.duration.split("h");
    return acc + parseInt(h) * 60 + parseInt(m?.replace("m", "") ?? "0");
  }, 0);

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      navigate("/admin/courses");
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed");
    }
  };

  const handleSuspendActivate = async () => {
    try {
      const data: any = await toggleCourseStatus(courseId);
      setCourseStatus(data.course.is_active ? "Active" : "Suspended");
      toast.success(data.message);
      setSuspendConfirm(false);
    } catch (err: any) {
      toast.error(err.message ?? "Cannot change course status");
    }
  };

  if (!courseData) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getAdminMenuItems("/admin/courses")} logout={logout} userRole="admin" activePage="admin-dashboard" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/courses")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Courses
                </Button>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Course Details</h1>
                  <p className="text-gray-600">View and manage course content</p>
                </div>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-courses" />
            </div>
          </header>

          <main className="p-6">
            {/* Course Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/3">
                    <img src={courseData.thumbnail} alt={courseData.courseName} className="w-full h-48 lg:h-full object-cover rounded-lg" />
                  </div>
                  <div className="lg:w-2/3">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl mb-2">{courseData.courseName}</h2>
                        <p className="text-gray-600 mb-3">{courseData.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge className="bg-violet-100 text-violet-700">{courseData.category}</Badge>
                          <Badge className={courseStatus === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{courseStatus}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { icon: <User className="h-5 w-5 text-violet-600" />, label: "Instructor", value: courseData.instructor },
                        { icon: <Users className="h-5 w-5 text-cyan-600" />, label: "Students", value: courseData.enrolledStudents.toLocaleString() },
                        { icon: <Clock className="h-5 w-5 text-violet-600" />, label: "Duration", value: minutesToHumanDuration(totalDuration) },
                      ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2">
                          {icon}
                          <div>
                            <p className="text-xs text-gray-600">{label}</p>
                            <p className="text-sm">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {courseStatus === "Active" ? (
                        <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 border-red-200" onClick={() => setSuspendConfirm(true)}>
                          <Ban className="h-4 w-4" /> Suspend Course
                        </Button>
                      ) : (
                        <Button variant="outline" className="gap-2 text-green-600 hover:bg-green-50 border-green-200" onClick={() => setSuspendConfirm(true)}>
                          <CheckCircle className="h-4 w-4" /> Activate Course
                        </Button>
                      )}
                      <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 border-red-200" onClick={() => setDeleteConfirm(true)}>
                        <Trash2 className="h-4 w-4" /> Delete Course
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Course Content</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    {selectedVideo && (
                      <Card className="mb-6">
                        <CardContent className="p-6">
                          <h3 className="text-xl mb-4">{selectedVideo.title}</h3>
                          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                            <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.videoUrl)}`} title="YouTube video" allowFullScreen />
                          </div>
                          {selectedVideo.description && <p className="text-gray-600 mb-4">{selectedVideo.description}</p>}

                          {selectedVideo.quizQuestions && selectedVideo.quizQuestions.length > 0 && (
                            <div className="mt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg">Quiz Questions</h4>
                                <Badge className="bg-blue-100 text-blue-700">{selectedVideo.quizQuestions.length} Question{selectedVideo.quizQuestions.length !== 1 ? "s" : ""}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-4 italic">Admin can view and moderate questions (read-only, delete only)</p>
                              <div className="space-y-4">
                                {selectedVideo.quizQuestions.map((question, qIndex) => (
                                  <Card key={question.id} className="border border-gray-200">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-2 flex-1">
                                          <Badge className="bg-violet-100 text-violet-700 mt-1">Q{qIndex + 1}</Badge>
                                          <p className="flex-1">{question.question}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 ml-2"
                                          onClick={() => setDeleteQuestionConfirm({ show: true, questionId: question.id, lectureId: selectedVideo.id })}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="space-y-2 mt-3">
                                        {question.options.map((option) => (
                                          <div key={option.label} className={`flex items-start gap-3 p-3 rounded-lg border ${option.isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                                            <span className={`text-sm shrink-0 ${option.isCorrect ? "text-green-700" : "text-gray-600"}`}>{option.label}.</span>
                                            <span className={`text-sm ${option.isCorrect ? "text-green-700" : "text-gray-700"}`}>{option.text}</span>
                                            {option.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />}
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Course Curriculum</CardTitle>
                        <p className="text-sm text-gray-600">{courseSections.length} sections • {totalLectures} lectures • {minutesToHumanDuration(totalDuration)} total length</p>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="space-y-2">
                          {courseSections.map((section, sectionIndex) => (
                            <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-lg px-4">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <span>{section.title}</span>
                                  <span className="text-sm text-gray-600">{section.lectures.length} lectures • {section.duration}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pt-2">
                                  {section.lectures.map((lecture) => (
                                    <motion.div key={lecture.id} whileHover={{ scale: 1.01 }}
                                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedVideo?.id === lecture.id ? "bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-200" : "hover:bg-gray-50"}`}
                                      onClick={() => setSelectedVideo(lecture)}>
                                      <div className="flex items-center gap-3">
                                        <PlayCircle className={`h-5 w-5 ${selectedVideo?.id === lecture.id ? "text-violet-600" : "text-gray-400"}`} />
                                        <span className="text-sm">{lecture.title}</span>
                                      </div>
                                      <span className="text-sm text-gray-600">{lecture.duration}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="overview">
                    <Card>
                      <CardHeader><CardTitle>Course Overview</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg mb-2">Description</h3>
                          <p className="text-gray-600">{courseData.description}</p>
                        </div>
                        <div>
                          <h3 className="text-lg mb-3">What You'll Learn</h3>
                          <ul className="space-y-2">
                            {courseData.outcomes.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                <span className="text-gray-600">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg mb-3">Requirements</h3>
                          <ul className="space-y-2 text-gray-600">
                            {courseData.requirements.map((item: string, i: number) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Course Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Language", value: "English" },
                      { label: "Level", value: courseData.level },
                      { label: "Total Duration", value: minutesToHumanDuration(totalDuration) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-sm text-gray-600 mb-1">{label}</p>
                        <p>{value}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Suspend/Activate */}
      <AlertDialog open={suspendConfirm} onOpenChange={setSuspendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{courseStatus === "Active" ? "Suspend Course" : "Activate Course"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {courseStatus === "Active" ? "suspend" : "activate"} this course?
              {courseStatus === "Active" && " Students will no longer be able to access it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendActivate}>{courseStatus === "Active" ? "Suspend" : "Activate"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete this course? This action cannot be undone. All student progress and enrollment data will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">Delete Course</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Question */}
      <AlertDialog open={deleteQuestionConfirm.show} onOpenChange={() => setDeleteQuestionConfirm({ show: false, questionId: null, lectureId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this quiz question? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success("Question deleted successfully"); setDeleteQuestionConfirm({ show: false, questionId: null, lectureId: null }); }} className="bg-red-600 hover:bg-red-700">
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}