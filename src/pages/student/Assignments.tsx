// ============================================================
// Assignments.tsx — Student Assignments (Clean Version)
// Applies: Single Responsibility, DRY
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { BookOpen, Calendar, Award, Upload, Clock, Menu } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchAllAssignments } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface StudentAssignmentsProps {
  logout: () => void;
  userRole: "student";
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  points: number;
  dueDate: string;
  status: "pending" | "graded" | "submitted";
  grade?: number;
}

// ─── Pure mapper ─────────────────────────────────────────────

const mapAssignment = (item: any): Assignment => ({
  id: item.assignment_id,
  title: item.assignment_title,
  course: item.course_title,
  points: item.questions_count ?? 0,
  dueDate: "No due date",
  status: item.attempts_used === 0 ? "pending" : "graded",
});

// ─── Sub-component: Assignment Card ──────────────────────────

function AssignmentCard({ assignment, onNavigate }: { assignment: Assignment; onNavigate: (id: number, status: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3>{assignment.course}</h3>
                <Badge className={
                  assignment.status === "graded" ? "bg-gradient-to-r from-green-500 to-green-600 text-white" :
                  assignment.status === "submitted" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" :
                  "border-violet-600 text-violet-600"
                }>
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />Full Course Assessment</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Due: {assignment.dueDate}</span>
                <span className="flex items-center gap-1"><Award className="h-4 w-4" />{assignment.points} points</span>
              </div>
            </div>
            <div className="flex gap-2">
              {assignment.status === "pending" && (
                <Button onClick={() => onNavigate(assignment.id, "pending")} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
                  <Upload className="mr-2 h-4 w-4" /> Take Assessment
                </Button>
              )}
              {assignment.status === "submitted" && (
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <Clock className="mr-2 h-4 w-4" />Waiting
                </Button>
              )}
              {assignment.status === "graded" && (
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => onNavigate(assignment.id, "graded")}>
                  View Feedback
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function StudentAssignments({ logout, userRole }: StudentAssignmentsProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });

    fetchAllAssignments()
      .then((data: any) => setAssignments(data.map(mapAssignment)))
      .catch(console.error);
  }, []);

  const handleNavigate = (id: number, status: string) => {
    if (status === "pending") navigate("/student/assignment-details", { state: { assignmentId: id } });
    else navigate("/student/assignment-feedback", { state: { assignmentId: id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        <Sidebar menuItems={getStudentMenuItems("/student/assignments")} logout={logout} userRole="student" activePage="student-assignments" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">Assessments</h1>
                <p className="text-gray-600 text-sm md:text-base">Track your assignments and submissions</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="graded">Graded</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6 space-y-4">
                {assignments.map((a) => <AssignmentCard key={a.id} assignment={a} onNavigate={handleNavigate} />)}
              </TabsContent>
              <TabsContent value="graded" className="mt-6 space-y-4">
                {assignments.filter((a) => a.status === "graded").map((a) => <AssignmentCard key={a.id} assignment={a} onNavigate={handleNavigate} />)}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}