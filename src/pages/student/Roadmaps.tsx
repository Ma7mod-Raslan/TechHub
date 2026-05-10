// ============================================================
// Roadmaps.tsx — Student Roadmaps (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ArrowRight, Menu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchRoadmaps, startRoadmap } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface Props { logout: () => void; userRole: "student"; }

export default function StudentRoadmaps({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });
    fetchRoadmaps().then((data: any) => setRoadmaps(data)).catch(console.error);
  }, []);

  const handleStart = async (roadmapId: number) => {
    try {
      const data: any = await startRoadmap(roadmapId);
      if (data.currentStepId) {
        const roadmap = roadmaps.find((r) => r.id === roadmapId);
        navigate("/student/roadmap-details", { state: { stepId: data.currentStepId, roadmap } });
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        <Sidebar menuItems={getStudentMenuItems("/student/roadmaps")} logout={logout} userRole="student" activePage="student-roadmaps" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">Learning Roadmaps</h1>
                <p className="text-gray-600 text-sm md:text-base">learning paths</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
              {roadmaps.map((roadmap, index) => (
                <motion.div key={roadmap.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle>{roadmap.title}</CardTitle>
                            <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500">{roadmap.difficulty}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{roadmap.description}</p>
                          <p className="text-sm text-gray-500">Estimated time: {roadmap.duration}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl mb-1">{roadmap.progress}%</div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {roadmap.steps.map((step: any, stepIndex: number) => (
                          <div key={stepIndex} className="flex items-center gap-4">
                            {step.status === "completed" ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                            ) : step.status === "in-progress" ? (
                              <div className="h-6 w-6 rounded-full border-4 border-violet-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                            )}
                            <div className={`flex-1 ${step.status === "locked" ? "text-gray-400" : ""}`}>{step.title}</div>
                            {step.status === "in-progress" && (
                              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                                onClick={() => navigate("/student/roadmap-details", { state: { stepId: step.id, roadmap } })}>
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {Number(roadmap.progress) === 0 && !roadmap.steps.find((s: any) => s.status === "in-progress") && (
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" onClick={() => handleStart(roadmap.id)}>
                          Start Roadmap
                        </Button>
                      )}
                      {roadmap.progress > 0 && roadmap.progress < 100 && !roadmap.steps.find((s: any) => s.status === "in-progress") && (
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                          onClick={() => { const s = roadmap.steps.find((s: any) => s.status !== "locked" && s.status !== "completed"); navigate("/student/roadmap-details", { state: { stepId: s?.id ?? roadmap.steps[0].id, roadmap } }); }}>
                          View Progress
                        </Button>
                      )}
                      {Number(roadmap.progress) === 100 && (
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                          onClick={() => navigate("/student/roadmap-details", { state: { stepId: roadmap.steps[0].id, roadmap } })}>
                          View Completed Roadmap
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}