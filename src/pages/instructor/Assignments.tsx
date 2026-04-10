import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import { motion } from "motion/react";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Users,
    Bell,
    User,
    Settings,
    MessageSquare,
    Plus,
    Menu,
    FileText,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";
import { ImageWithFallback } from "../../components/Assets/ImageWithFallback";

export default function InstructorAssignments({
    navigate,
    logout,
    userRole,
    navigationState,
}: any) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const courseId = navigationState?.courseId;

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", page: "instructor-dashboard" },
        { icon: BookOpen, label: "My Courses", page: "instructor-courses" },
        { icon: BarChart3, label: "Assignments", page: "instructor-assignments" },
        { icon: Users, label: "Community", page: "community" },
        { icon: Bell, label: "Notifications", page: "instructor-notifications" },
        { icon: User, label: "Profile", page: "instructor-profile" },
        { icon: Settings, label: "Settings", page: "instructor-settings" },
        { icon: MessageSquare, label: "Contact Us", page: "instructor-contact" },
    ];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(
                    "${API_URL}/api/courses/instructor",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );

                const data = await res.json();
                setCourses(data.courses ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        if (courseId) {
            navigate("instructor-manage-assignment", "instructor", {
                courseId,
            });
        }
    }, [courseId]);

    const filteredCourses = courses.filter((course: any) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <Sidebar
                    menuItems={menuItems}
                    navigate={navigate}
                    logout={logout}
                    userRole="instructor"
                    activePage="instructor-assignments"
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />

                <div className="flex-1">
                    <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">

                        {/* Mobile Layout */}
                        <div className="lg:hidden">
                            <div className="flex items-start justify-between mb-4 gap-4">

                                {/* ☰ Mobile Menu Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0"
                                    onClick={() => setIsMobileOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>

                                <div className="flex-1">
                                    <h1 className="text-xl">Assignments</h1>
                                    <p className="text-gray-600 text-sm">
                                        Manage your course assignments
                                    </p>
                                </div>

                                <HeaderIcons
                                    navigate={navigate}
                                    logout={logout}
                                    userRole={userRole}
                                />
                            </div>

                            {/* Mobile Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:flex items-center justify-between gap-6">
                            <div>
                                <h1 className="text-2xl font-semibold">Assignments</h1>
                                <p className="text-gray-600 text-sm">
                                    Manage your course assignments
                                </p>
                            </div>

                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none"
                                />
                            </div>

                            <HeaderIcons
                                navigate={navigate}
                                logout={logout}
                                userRole={userRole}
                            />
                        </div>
                    </header>

                    <main className="p-6">
                        {loading ? (
                            <p>Loading courses...</p>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No courses found.
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course: any, index: number) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        <Card
                                            className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                                            onClick={() =>
                                                navigate("instructor-manage-assignment", "instructor", {
                                                    courseId: course.id,
                                                })
                                            }
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative h-48">
                                                <ImageWithFallback
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>

                                            {/* Info */}
                                            <CardContent className="p-4">
                                                <h3 className="text-lg mb-2 line-clamp-2 text-gray-900">
                                                    {course.title}
                                                </h3>

                                                <p className="text-sm text-gray-500 mb-3">
                                                    {(course.questions_count ?? 0)} Questions
                                                </p>

                                                <Button
                                                    className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate("instructor-manage-assignment", "instructor", {
                                                            courseId: course.id,
                                                        });
                                                    }}
                                                >
                                                    Manage Assignments
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <AIAssistant />
        </div>
    );
}