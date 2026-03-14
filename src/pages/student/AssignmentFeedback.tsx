import { useEffect, useState } from "react";
import {
    ArrowLeft,
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
    CheckCircle,
    XCircle
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";

interface Props {
    navigate: (page: string, role?: any, state?: any) => void;
    logout: () => void;
    userRole: "student";
    navigationState?: any;
}

export default function StudentAssignmentFeedback({
    navigate,
    logout,
    userRole,
    navigationState
}: Props) {

    const assignmentId = navigationState?.assignmentId;

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", page: "student-dashboard" },
        { icon: BookOpen, label: "Courses", page: "student-courses" },
        { icon: FileText, label: "Assignments", page: "student-assignments", active: true },
        { icon: Award, label: "Certificates", page: "student-certificates" },
        { icon: Users, label: "Community", page: "community" },
        { icon: Map, label: "Roadmaps", page: "student-roadmaps" },
        { icon: Code, label: "Compiler", page: "student-compiler" },
        { icon: Bell, label: "Notifications", page: "student-notifications" },
        { icon: User, label: "Profile", page: "student-profile" },
        { icon: Settings, label: "Settings", page: "student-settings" },
        { icon: MessageSquare, label: "Contact Us", page: "student-contact" }
    ];

    useEffect(() => {
        const fetchFeedback = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const attemptsRes = await fetch(
                    `http://localhost:3000/api/assignments/${assignmentId}/attempts`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const attempts = await attemptsRes.json();
                if (!attempts.length) return;
                const latestAttempt = attempts[0];
                const detailsRes = await fetch(
                    `http://localhost:3000/api/assignments/${assignmentId}/attempts/${latestAttempt.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const details = await detailsRes.json();
                setData({
                    ...details,
                    percentage: Number(details.percentage)
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [assignmentId]);
    if (loading) return <div className="p-6">Loading...</div>;
    if (!data) return <div className="p-6">No data</div>;
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    menuItems={menuItems}
                    navigate={navigate}
                    logout={logout}
                    userRole="student"
                    activePage="student-assignments"
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />
                <div className="flex-1">
                    {/* Header */}
                    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("student-assignments")}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-semibold">
                                    Assignment Feedback
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Review your answers and results
                                </p>
                            </div>
                        </div>
                        <HeaderIcons
                            navigate={navigate}
                            logout={logout}
                            userRole={userRole}
                        />
                    </header>
                    {/* Content */}
                    <main className="p-6 max-w-3xl mx-auto">
                        {/* Result */}
                        <Card className="mb-6">
                            <CardContent className="p-6 text-center space-y-3">
                                <h2 className="text-xl font-semibold">
                                    Assignment Result
                                </h2>
                                <p>
                                    Score: {data.score}/{data.questions.length}
                                </p>
                                <p>
                                    Percentage: {data.percentage.toFixed(2)}%
                                </p>
                                <p
                                    className={
                                        data.is_passed
                                            ? "text-green-600 font-semibold"
                                            : "text-red-600 font-semibold"
                                    }
                                >
                                    {data.is_passed ? "Passed" : "Failed"}
                                </p>
                            </CardContent>
                        </Card>
                        {/* Questions */}
                        {data.questions.map((q: any) => (
                            <Card key={q.question_id} className="mb-4">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-4">
                                        {q.question_text}
                                    </h3>
                                    {q.options.map((o: any) => {
                                        const isStudentAnswer =
                                            q.selected_option_id === o.id;
                                        const isCorrect =
                                            o.is_correct;
                                        return (
                                            <div
                                                key={o.id}
                                                className={`p-2 rounded mb-2 flex items-center gap-2 ${isCorrect
                                                        ? "bg-green-100"
                                                        : isStudentAnswer
                                                            ? "bg-red-100"
                                                            : ""
                                                    }`}
                                            >
                                                {isCorrect && (
                                                    <CheckCircle className="text-green-600 h-4 w-4" />
                                                )}
                                                {isStudentAnswer && !isCorrect && (
                                                    <XCircle className="text-red-600 h-4 w-4" />
                                                )}
                                                {o.option_text}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </main>
                </div>
            </div>
            <AIAssistant />
        </div>
    );
}