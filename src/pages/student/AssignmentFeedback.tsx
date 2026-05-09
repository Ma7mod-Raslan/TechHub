// ============================================================
// AssignmentFeedback.tsx — Student Assignment Feedback (Clean Version)
// ============================================================

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Menu } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import AIAssistant from "../../components/AIAssistant";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAssignmentAttempts, fetchAttemptDetails } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface Props { logout: () => void; userRole: "student"; }

export default function StudentAssignmentFeedback({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const assignmentId = location.state?.assignmentId;

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });

    const load = async () => {
      try {
        const attempts: any = await fetchAssignmentAttempts(assignmentId);
        if (!attempts.length) return;
        const details: any = await fetchAttemptDetails(assignmentId, attempts[0].id);
        setData({ ...details, percentage: Number(details.percentage) });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [assignmentId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getStudentMenuItems("/student/assignments")} logout={logout} userRole="student" activePage="student-assignments" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/student/assignments")}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-xl font-semibold">Assessment Feedback</h1>
                <p className="text-gray-500 text-sm">Review your answers and results</p>
              </div>
            </div>
            <HeaderIcons logout={logout} userRole={userRole} />
          </header>

          <main className="p-6 max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-6 text-center space-y-3">
                <h2 className="text-xl font-semibold">Assessment Result</h2>
                <p>Score: {data.score}/{data.questions.length}</p>
                <p>Percentage: {data.percentage.toFixed(2)}%</p>
                <p className={data.is_passed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {data.is_passed ? "Passed" : "Failed"}
                </p>
              </CardContent>
            </Card>

            {data.questions.map((q: any) => (
              <Card key={q.question_id} className="mb-4">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">{q.question_text}</h3>
                  {q.options.map((o: any) => {
                    const isStudentAnswer = q.selected_option_id === o.id;
                    return (
                      <div key={o.id} className={`p-2 rounded mb-2 flex items-center gap-2 ${o.is_correct ? "bg-green-100" : isStudentAnswer ? "bg-red-100" : ""}`}>
                        {o.is_correct && <CheckCircle className="text-green-600 h-4 w-4" />}
                        {isStudentAnswer && !o.is_correct && <XCircle className="text-red-600 h-4 w-4" />}
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