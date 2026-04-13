import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Play,
    Star,
    Users,
    Clock,
    Globe,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    X,
    Award,
    MessageSquare,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserRole } from '../App';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';
import { toast } from 'sonner';
import { COURSE_CATEGORIES } from '../constants/courseCategories';
import AIAssistant from '../components/AIAssistant';


interface CourseDetailsProps {
    navigate: (page: string, role?: UserRole, state?: any) => void;
    userRole: UserRole;
    logout?: () => void;
    navigationState?: {
        courseId?: number;
    };
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

export default function CourseDetails({
    navigate,
    userRole,
    logout,
    navigationState,
}: CourseDetailsProps) {

    // Simulating enrollment status - in real app, this would come from backend/localStorage
    const [activeTab, setActiveTab] = useState('overview');
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [courseSections, setCourseSections] = useState<Section[]>([]);
    const [totalDuration, setTotalDuration] = useState<string>('0m');

    const id = Number(localStorage.getItem("selectedCourseId"));






    console.log(course);




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


    const fetchCourseVideos = async () => {
        const res = await fetch(
            `http://localhost:5000/api/courses/${id}/videos-preview`
        );

        if (!res.ok) {
            setCourseSections([]);
            return;
        }

        const videos = await res.json();
        const totalSeconds = videos.reduce(
            (sum: number, v: any) => sum + (Number(v.duration) || 0),
            0
        );

        setTotalDuration(formatTotalDuration(totalSeconds));

        setCourseSections([
            {
                title: "Course Content",
                duration: formatTotalDuration(totalSeconds),
                lectures: videos.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    duration: Number(v.duration) || 0,
                    completed: false,
                })),
            },
        ]);
    };




    // Flatten all lectures for navigation
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/courses/all-info/${id}`
                );

                if (!res.ok) throw new Error("Failed to load course");

                const data = await res.json();

                setCourse(data);
                setCourseSections([
                    {
                        title: "Course Content",
                        duration: formatTotalDuration(data.total_duration),
                        lectures: data.videos.map((v: any) => ({
                            id: v.id,
                            title: v.title,
                            duration: v.duration,
                            completed: false,
                        })),
                    },
                ]);

                setTotalDuration(formatTotalDuration(data.total_duration));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);






    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {/* Navbar */}
            <Navbar navigate={navigate} userRole="guest" />

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex gap-2 items-center">
                                <Badge>
                                    {COURSE_CATEGORIES[course?.category] ?? course?.category}

                                </Badge>

                                <Badge variant="outline" className="capitalize">
                                    {course?.level}
                                </Badge>
                            </div>

                            <h1 className="text-4xl mb-4">{course?.title}</h1>

                            <p className="text-xl text-gray-600 mb-6">
                                {course?.description}
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
                                </p>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            {/* Overview */}
                            <TabsContent value="overview" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h2 className="text-2xl mb-4">What you'll learn</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {course?.outcomes?.length ? (
                                                course.outcomes.map((item: string, i: number) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
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
                                        <ul className="list-disc list-inside space-y-2">
                                            {course?.requirements?.length ? (
                                                course.requirements.map((req: string, i: number) => (
                                                    <li key={i}>{req}</li>
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

                            {/* Curriculum */}
                            <TabsContent value="curriculum" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h2 className="text-2xl mb-4">Course Curriculum</h2>

                                        <Accordion type="single" collapsible>
                                            {courseSections.map((section, i) => (
                                                <AccordionItem key={i} value={`section-${i}`}>
                                                    <AccordionTrigger>
                                                        <div className="flex justify-between w-full pr-4">
                                                            <span>{section.title}</span>
                                                            <span className="text-sm text-gray-600">
                                                                {section.lectures.length} lectures • {section.duration}
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {section.lectures.map((lecture) => (
                                                                <div
                                                                    key={lecture.id}
                                                                    className="flex items-center gap-3 py-3 px-3 rounded-lg bg-gray-100 opacity-70"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
                                                                        <Play className="h-4 w-4 text-white" />
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

                            {/* Instructor */}
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
                                                <h2 className="text-2xl mb-2">{course?.instructor_name}</h2>
                                                <p className="text-gray-600">Course Instructor</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reviews */}
                            <TabsContent value="reviews" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h2 className="text-2xl mb-6">Student Reviews</h2>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="border-b pb-4 mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex">
                                                        {Array.from({ length: 5 }).map((_, j) => (
                                                            <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                    <span>John Doe</span>
                                                </div>
                                                <p className="text-gray-600">
                                                    Excellent course! Very comprehensive and well-structured.
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* RIGHT */}
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
                                        <Button
                                            className="w-full mb-6 bg-gradient-to-r from-violet-600 to-cyan-500"
                                            onClick={() => navigate("signup")}
                                        >
                                            Sign up to Enroll
                                        </Button>

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
            <AIAssistant />

        </div>
    );

}