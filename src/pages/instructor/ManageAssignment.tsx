import { useEffect, useState } from "react";
import { Menu, Plus, Trash2, Edit } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { notifyUpdate } from "../../utils/notifications";
import { getInstructorMenuItems } from "./config/instructorMenu";

export default function InstructorManageAssignment({ logout, userRole }: any) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [limitAttempts, setLimitAttempts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const location = useLocation() as { state?: { courseId?: number } };
  const courseId = location.state?.courseId;
  const assignmentId = localStorage.getItem(`assignment_${courseId}`);

  const fetchAssignment = async () => {
    if (!assignmentId) {
      navigate("/instructor/create-assignment", { state: { courseId } });
      return;
    }

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (!res.ok) {
        navigate("/instructor/create-assignment", { state: { courseId } });
        return;
      }

      const data = await res.json();
      setAssignment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignment(); }, []);

  useEffect(() => {
    if (assignment?.max_attempts) setLimitAttempts(true);
  }, [assignment]);

  const handleAddQuestion = async () => {
    if (!questionText.trim()) return;
    const correctCount = choices.filter(c => c.is_correct).length;
    if (correctCount !== 1) { toast.warning("Select exactly one correct answer"); return; }

    try {
      if (editingQuestion) {
        await fetch(`/api/assignments/question/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: JSON.stringify({ question_text: questionText, options: choices }),
        });
        toast.success("Question updated ✅");
      } else {
        const res = await fetch(`/api/assignments/${assignment.id}/question`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: JSON.stringify({ question_text: questionText }),
        });
        const newQuestion = await res.json();

        await fetch(`/api/assignments/question/${newQuestion.id}/options`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          body: JSON.stringify({ options: choices }),
        });

        toast.success("Question added");
        notifyUpdate();
      }

      setQuestionText("");
      setChoices([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
      setEditingQuestion(null);
      setShowAddForm(false);
      fetchAssignment();
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    await fetch(`/api/assignments/question/${questionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    toast.success("Question deleted 🗑");
    notifyUpdate();
    fetchAssignment();
  };

  const handleUpdateSettings = async () => {
    await fetch(`/api/assignments/${assignment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      body: JSON.stringify({ passing_percentage: assignment.passing_percentage, max_attempts: assignment.max_attempts }),
    });
    toast.success("Settings updated");
    notifyUpdate();
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user || user.role !== "instructor") navigate("/login", { replace: true });
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!assignment) return null;

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          menuItems={getInstructorMenuItems("/instructor/assignments")}
          logout={logout}
          userRole="instructor"
          activePage="instructor-assignments"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 overflow-y-auto">
          <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold">Manage Assessment</h1>
            </div>
            <Button
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
              onClick={() => { setEditingQuestion(null); setShowAddForm(true); }}
            >
              <Plus className="mr-2 h-4 w-4" />Add Question
            </Button>
          </header>

          <main className="p-6 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Success rate
                </h3>
                <Input
                  type="number"
                  value={assignment.passing_percentage}
                  onChange={(e) => setAssignment({ ...assignment, passing_percentage: Number(e.target.value) })}
                  placeholder="Passing Percentage"
                />
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={limitAttempts} onChange={() => {
                    setLimitAttempts(!limitAttempts);
                    if (limitAttempts) setAssignment({ ...assignment, max_attempts: null });
                  }} />
                  <span>Limit Attempts</span>
                </div>
                {limitAttempts && (
                  <Input
                    type="number"
                    placeholder="Max Attempts"
                    value={assignment.max_attempts ?? ""}
                    onChange={(e) => setAssignment({ ...assignment, max_attempts: Number(e.target.value) })}
                  />
                )}
                <Button onClick={handleUpdateSettings} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {assignment.questions?.length === 0 && <p className="text-gray-500">No questions yet. Add your first question.</p>}

              {showAddForm && (
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-3">
                    <Input placeholder="Question text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
                    {choices.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input type="radio" name="correct-answer" checked={option.is_correct} onChange={() => setChoices(choices.map((opt, i) => ({ ...opt, is_correct: i === index })))} />
                        <Input placeholder={`Option ${index + 1}`} value={option.option_text} onChange={(e) => setChoices(choices.map((opt, i) => i === index ? { ...opt, option_text: e.target.value } : opt))} />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300" onClick={handleAddQuestion}>Save Question</Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {assignment.questions?.map((q: any, index: number) => (
                <Card key={q.id}>
                  <CardContent className="p-6 space-y-3">
                    <h4 className="font-semibold">{index + 1}. {q.question_text}</h4>
                    {q.options?.map((opt: any) => (
                      <div key={opt.id} className="text-sm">• {opt.option_text}{opt.is_correct && " ✔"}</div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={() => {
                        setEditingQuestion(q);
                        setQuestionText(q.question_text);
                        setChoices(q.options);
                        setShowAddForm(true);
                      }}>
                        <Edit className="h-4 w-4 mr-1" />Edit
                      </Button>
                      <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteId(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Question</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { await handleDeleteQuestion(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}