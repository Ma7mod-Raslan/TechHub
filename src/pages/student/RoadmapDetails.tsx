import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard, BookOpen, FileText, Award, Users, Code, Map, Bell, User, Settings,
    CheckCircle2, Circle, Lock, ArrowRight, ArrowLeft, Menu, MessageSquare, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';

interface RoadmapDetailsProps {
    logout: () => void;
    userRole: 'student';
}

interface RoadmapStep {
    id: number;
    title: string;
    description: string;
    learningObjectives: string[];
    status: 'completed' | 'in-progress' | 'locked';
    estimated_time: string;
}

interface RoadmapData {
    id: number;
    title: string;
    description: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    progress: number;
    steps: RoadmapStep[];
}

export default function RoadmapDetails({ logout, userRole, }: RoadmapDetailsProps) {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);











    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard' },
        { icon: BookOpen, label: 'Courses', page: '/student/courses' },
        { icon: FileText, label: 'Assignments', page: '/student/assignments' },
        { icon: Award, label: 'Certificates', page: '/student/certificates' },
        { icon: Users, label: 'Community', page: '/community' },
        { icon: Map, label: 'Roadmaps', page: '/student/roadmaps', active: true },
        { icon: Code, label: 'Compiler', page: '/student/compiler' },
        { icon: Bell, label: 'Notifications', page: '/student/notifications' },
        { icon: User, label: 'Profile', page: '/student/profile' },
        { icon: Settings, label: 'Settings', page: '/student/settings' },
        { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
    ];


    const location = useLocation();
    const stepId = (location.state as any)?.stepId;
    const roadmapFromNav = (location.state as any)?.roadmap;

    const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
    const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
    const [updatedRoadmap, setUpdatedRoadmap] = useState(roadmapFromNav);

    useEffect(() => {
        if (!stepId) return;

        const fetchStep = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`http://localhost:5000/api/steps/${stepId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                // Build roadmapData using the step details + roadmap from navigation
                setRoadmapData({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    duration: data.duration,
                    difficulty: data.difficulty,
                    progress: data.progress,
                    steps: roadmapFromNav?.steps || [data.step]  // use full steps list if available
                });

                setSelectedStep({
                    id: data.step.id,
                    title: data.step.title,
                    description: data.step.description,
                    learningObjectives: data.step.learningObjectives,
                    status: data.step.status,
                    estimated_time: data.step.estimated_time
                });

            } catch (err) {
                console.error(err);
            }
        };

        fetchStep();
    }, [stepId]);



    const handleMarkAsCompleted = async () => {
        if (!selectedStep || !roadmapData) return;
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `http://localhost:5000/api/steps/${selectedStep.id}/complete`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            toast.success("Step completed 🎉");

            const currentIdx = roadmapData.steps.findIndex(s => s.id === selectedStep.id);

            setSelectedStep(prev => prev ? { ...prev, status: "completed" } : prev);

            setRoadmapData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    progress: data.progress,
                    steps: prev.steps.map((step, idx) =>
                        step.id === selectedStep.id
                            ? { ...step, status: "completed" }
                            : idx === currentIdx + 1
                                ? { ...step, status: "in-progress" }
                                : step
                    )
                };
            });

            setUpdatedRoadmap((prev: any) => ({
                ...prev,
                steps: prev.steps.map((s: any, idx: number) =>
                    s.id === selectedStep.id
                        ? { ...s, status: "completed" }
                        : idx === currentIdx + 1
                            ? { ...s, status: "in-progress" }
                            : s
                )
            }));

        } catch (err) {
            console.error(err);
            toast.error("Error");
        }
    };

    const handleGoToNextStep = () => {
        if (!selectedStep || !roadmapData) return;

        const currentIndex = roadmapData.steps.findIndex(s => s.id === selectedStep.id);
        const nextStep = roadmapData.steps[currentIndex + 1];

        if (!nextStep) {
            toast.success("You've completed the roadmap 🎉");
            return;
        }

        navigate('/student/roadmap-details', {
            state: { stepId: nextStep.id, roadmap: updatedRoadmap }
        });
    };
    const handleStepClick = async (step: RoadmapStep) => {
        if (step.status === 'locked') {
            toast.error('This step is locked. Complete previous steps first!');
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:5000/api/steps/${step.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            setSelectedStep({
                id: data.step.id,
                title: data.step.title,
                description: data.step.description,
                learningObjectives: data.step.learningObjectives,
                status: data.step.status,
                estimated_time: data.step.estimated_time
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load step details");
        }
    };

    const getStatusIcon = (status: RoadmapStep['status'], isSelected: boolean) => {
        if (status === 'completed') {
            return <CheckCircle2 className="h-8 w-8 text-green-600" />;
        } else if (status === 'in-progress') {
            return (
                <div className={`h-8 w-8 rounded-full border-4 flex items-center justify-center ${isSelected ? 'border-violet-600 bg-violet-100' : 'border-violet-600'
                    }`}>
                    <div className="h-3 w-3 rounded-full bg-violet-600" />
                </div>
            );
        } else {
            return <Lock className="h-8 w-8 text-gray-300" />;
        }
    };

    const getStatusBadge = (status: RoadmapStep['status']) => {
        if (status === 'completed') {
            return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
        } else if (status === 'in-progress') {
            return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-700">Locked</Badge>;
        }
    };






    if (!roadmapData || !selectedStep) {
        return <div className="p-6">Loading...</div>;
    }

    const currentIndex =
        roadmapData && selectedStep
            ? roadmapData.steps.findIndex(s => s.id === selectedStep.id)
            : -1;

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <div className="flex relative h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    menuItems={menuItems}
                    logout={logout}
                    userRole="student"
                    activePage="student-roadmaps"
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />

                <div className="flex-1 lg:ml-0 w-full min-w-0 flex flex-col h-screen overflow-hidden">
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

                            <div className="flex items-center gap-4 flex-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/student/roadmaps')}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Roadmaps</span>
                                </Button>
                                <div className="flex-1">
                                    <h1 className="text-xl md:text-2xl">{roadmapData.title}</h1>
                                    <p className="text-gray-600 text-sm md:text-base hidden sm:block">Track your learning progress</p>
                                </div>
                            </div>
                            <HeaderIcons logout={logout} userRole={userRole} />
                        </div>
                    </header>

                    <main className="p-4 md:p-6 flex-1 overflow-y-auto scrollbar-hide">
                        {/* Progress Overview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="mb-6">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl">{roadmapData.title}</h2>
                                                <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">
                                                    {roadmapData.difficulty}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600">{roadmapData.description}</p>
                                            <p className="text-sm text-gray-500 mt-1">Duration: {roadmapData.duration}</p>
                                        </div>
                                        <div className="text-center md:text-right">
                                            <div className="text-4xl mb-1 bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                                                {roadmapData.progress}%
                                            </div>
                                            <div className="text-sm text-gray-600">Complete</div>
                                        </div>
                                    </div>
                                    <Progress value={roadmapData.progress} className="h-3" />
                                    <p className="text-sm text-gray-600 mt-2">
                                        {roadmapData.steps.filter(s => s.status === 'completed').length} of {roadmapData.steps.length} steps completed
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="flex flex-col lg:flex-row gap-6 min-h-0 flex-1">
                            {/* Vertical Stepper */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="lg:w-[45%] flex-shrink-0 overflow-y-auto scrollbar-hide"
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Roadmap Steps</CardTitle>
                                        <p className="text-sm text-gray-600">Click on a step to view details</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            {roadmapData.steps.map((step, index) => (
                                                <motion.div
                                                    key={step.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div
                                                        className={`relative p-4 rounded-lg transition-all duration-200 cursor-pointer ${selectedStep.id === step.id
                                                            ? 'bg-gradient-to-r from-violet-50 to-cyan-50 border-2 border-violet-200'
                                                            : step.status === 'locked'
                                                                ? 'bg-gray-50 opacity-60'
                                                                : 'hover:bg-gray-50 border-2 border-transparent'
                                                            }`}
                                                        onClick={() => handleStepClick(step)}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Step Icon */}
                                                            <div className="flex-shrink-0">
                                                                {getStatusIcon(step.status, selectedStep.id === step.id)}
                                                            </div>

                                                            {/* Step Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-sm ${step.status === 'locked' ? 'text-gray-400' : ''
                                                                        }`}>
                                                                        Step {index + 1}
                                                                    </span>
                                                                    {selectedStep.id === step.id && (
                                                                        <ChevronRight className="h-4 w-4 text-violet-600" />
                                                                    )}
                                                                </div>
                                                                <h4 className={`mb-1 ${step.status === 'locked' ? 'text-gray-400' : ''
                                                                    }`}>
                                                                    {step.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">{step.estimated_time}</p>
                                                            </div>
                                                        </div>

                                                        {/* Connecting Line */}
                                                        {index < roadmapData.steps.length - 1 && (
                                                            <div
                                                                className={`absolute left-[2.9rem] top-[4.5rem] w-0.5 h-6 ${step.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Step Details Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="lg:w-[55%] flex-1 min-w-0 h-[calc(100vh-320px)] overflow-y-auto scrollbar-hide"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedStep.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <CardTitle>{selectedStep.title}</CardTitle>
                                                            {getStatusBadge(selectedStep.status)}
                                                        </div>
                                                        <p className="text-sm text-gray-600">Estimated time: {selectedStep.estimated_time}</p>
                                                    </div>
                                                    {getStatusIcon(selectedStep.status, true)}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Description */}
                                                <div>
                                                    <h3 className="text-lg mb-2">About This Step</h3>
                                                    <p className="text-gray-600">{selectedStep.description}</p>
                                                </div>

                                                {/* Learning Objectives */}
                                                <div>
                                                    <h3 className="text-lg mb-3">Learning Objectives</h3>
                                                    <ul className="space-y-3">
                                                        {selectedStep.learningObjectives?.map((objective, index) => (
                                                            <motion.li
                                                                key={index}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                                                                <span className="text-gray-700">{objective}</span>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Status Information */}
                                                {selectedStep.status === 'locked' && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm">
                                                                    This step is currently locked. Complete the previous steps to unlock it.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedStep.status === 'in-progress' && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="h-5 w-5 rounded-full border-2 border-blue-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm">
                                                                    You're currently working on this step. Mark it as completed when you finish all the learning objectives.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedStep.status === 'completed' && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm">
                                                                    Congratulations! You've completed this step. Keep going to finish the roadmap!
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                                    {selectedStep.status === 'in-progress' && (
                                                        <Button
                                                            onClick={handleMarkAsCompleted}
                                                            className="flex-1 !text-white"
                                                            style={{ background: 'linear-gradient(to right, #16a34a, #22c55e)' }}
                                                            onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #16a34a)')}
                                                            onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #22c55e)')}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                            Mark as Completed
                                                        </Button>
                                                    )}

                                                    {selectedStep.status === 'completed' && currentIndex < roadmapData.steps.length - 1 && (
                                                        <Button
                                                            onClick={handleGoToNextStep}
                                                            variant="default"
                                                            className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white"
                                                        >
                                                            Go to Next Step
                                                            <ArrowRight className="h-4 w-4 ml-2" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
            <AIAssistant />
        </div>
    );
}
