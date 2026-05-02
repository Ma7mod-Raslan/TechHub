import { useEffect, useState } from "react";
import { ArrowLeft, Award, Bell, BookOpen, Code, FileText, LayoutDashboard, Menu, MessageSquare, Settings, User, Users, Map } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../../components/ui/dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { notifyUpdate } from "../../utils/notifications";

interface Props {
    logout: () => void;
    userRole: "student";
}

export default function StudentAssignmentDetails({
    logout,
    userRole,
}: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    const assignmentId = location.state?.assignmentId;

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [assignment, setAssignment] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [openResult, setOpenResult] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard' },
        { icon: BookOpen, label: 'Courses', page: '/student/courses' },
        { icon: FileText, label: 'Assignments', page: '/student/assignments', active: true },
        { icon: Award, label: 'Certificates', page: '/student/certificates' },
        { icon: Users, label: 'Community', page: '/student/community' },
        { icon: Map, label: 'Roadmaps', page: '/student/roadmaps' },
        { icon: Code, label: 'Compiler', page: '/student/compiler' },
        { icon: Bell, label: 'Notifications', page: '/student/notifications' },
        { icon: User, label: 'Profile', page: '/student/profile' },
        { icon: Settings, label: 'Settings', page: '/student/settings' },
        { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
    ];

    useEffect(() => {

        const fetchAssignment = async () => {

            try {

                const token = localStorage.getItem("accessToken");

                const res = await fetch(
                    `http://localhost:5000/api/assignments/student/${assignmentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await res.json();

                setAssignment(data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        };

        fetchAssignment();

    }, [assignmentId]);

    const handleAnswer = (questionId: number, optionId: number) => {

        setAnswers(prev => {

            const filtered = prev.filter(a => a.question_id !== questionId);

            return [
                ...filtered,
                {
                    question_id: questionId,
                    selected_option_id: optionId
                }
            ];

        });

    };

    const submitAssignment = async () => {

        if (answers.length !== assignment.questions.length) {
            alert("Please answer all questions");
            return;
        }

        try {
            console.log("answers", answers);


            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `http://localhost:5000/api/assignments/${assignmentId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ answers })
                }
            );

            console.log("response status", res.status);

            const data = await res.json();
            console.log("server response", data);



            setResult(data.data);

            setOpenResult(true);
            notifyUpdate();

        } catch (err) {
            console.error(err);
        }

    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!token || !user) {
            navigate("/login", { replace: true });
            return;
        }

        if (user.role !== "student") {
            navigate(`/${user.role}/dashboard`, { replace: true });
        }
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    if (!assignment) return <div className="p-6">Assignment not found</div>;

    return (

        <div className="min-h-screen bg-gray-50">

            <div className="flex">

                {/* Sidebar */}

                <Sidebar
                    menuItems={menuItems}
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
                                onClick={() => navigate("/student/assignments")}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div>

                                <h1 className="text-xl font-semibold">
                                    Course Assignment
                                </h1>

                                <p className="text-gray-500 text-sm">
                                    {assignment.title}
                                </p>

                            </div>

                        </div>

                        <HeaderIcons

                            logout={logout}
                            userRole={userRole}
                        />

                    </header>

                    {/* Content */}

                    <main className="p-6 max-w-3xl mx-auto">

                        <div className="mb-6 text-gray-700">

                            <p>
                                Passing Score:
                                <span className="font-semibold ml-2">
                                    {assignment.passing_percentage}%
                                </span>
                            </p>

                            <p>
                                Max Attempts:
                                <span className="font-semibold ml-2">
                                    {assignment.max_attempts ?? "Unlimited"}
                                </span>
                            </p>

                        </div>

                        {/* Questions */}

                        {assignment.questions.map((q: any) => (

                            <Card key={q.id} className="mb-6">

                                <CardContent className="p-6">

                                    <h3 className="font-medium mb-4">
                                        {q.question_text}
                                    </h3>

                                    {q.options.map((o: any) => (

                                        <label
                                            key={o.id}
                                            className="flex items-center gap-2 mb-2 cursor-pointer"
                                        >

                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                onChange={() => handleAnswer(q.id, o.id)}
                                            />

                                            {o.option_text}

                                        </label>

                                    ))}

                                </CardContent>

                            </Card>

                        ))}

                        {/* Submit */}

                        <Button
                            onClick={submitAssignment}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500"
                        >
                            Submit Assignment
                        </Button>

                        {/* Result */}

                        <Dialog open={openResult} onOpenChange={setOpenResult}>

                            <DialogContent className="max-w-md">

                                <DialogHeader>
                                    <DialogTitle>
                                        Assignment Result
                                    </DialogTitle>

                                    <DialogDescription>
                                        Here is your assignment result
                                    </DialogDescription>
                                </DialogHeader>

                                {result && (

                                    <div className="space-y-3 text-center">

                                        <p className="text-lg">
                                            Score: {result.score}/{result.totalQuestions}
                                        </p>

                                        <p className="text-lg">
                                            Percentage: {result.percentage.toFixed(2)}%
                                        </p>

                                        <p
                                            className={
                                                result.is_passed
                                                    ? "text-green-600 font-semibold"
                                                    : "text-red-600 font-semibold"
                                            }
                                        >
                                            {result.is_passed ? "Passed 🎉" : "Failed"}
                                        </p>

                                        <button
                                            onClick={() => navigate("student-assignments")}
                                            className="mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-4 py-2 rounded"
                                        >
                                            Back to Assignments
                                        </button>

                                    </div>

                                )}

                            </DialogContent>

                        </Dialog>

                    </main>

                </div>

            </div>

            <AIAssistant />

        </div>

    );

}