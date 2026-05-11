import { useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import HeaderIcons from "../../components/HeaderIcons";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { notifyUpdate } from "../../utils/notifications";
import { getInstructorMenuItems } from "./config/instructorMenu";
import AIAssistant from "../../components/AIAssistant";

export default function InstructorCreateAssignment({ logout, userRole }: any) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation() as { state?: { courseId?: number } };
  const courseId = location.state?.courseId;

  const [assignmentData, setAssignmentData] = useState({
    passing_percentage: 60,
    max_attempts: null as number | null,
  });

  const [limitAttempts, setLimitAttempts] = useState(false);

  const [questions, setQuestions] = useState([
    {
      question_text: "",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  const handleCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, index) => ({
      ...opt,
      is_correct: index === oIndex,
    }));
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      },
    ]);
  };

  const handleCreateAssignment = async () => {
    try {
      for (const question of questions) {
        const correctCount = question.options.filter(o => o.is_correct).length;
        if (correctCount !== 1) {
          toast.warning("Each question must have exactly one correct answer");
          return;
        }
      }

      const assignmentRes = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          title: "Course Assessment",
          description: null,
          passing_percentage: assignmentData.passing_percentage,
          max_attempts: limitAttempts ? assignmentData.max_attempts : null,
        }),
      });

      const assignment = await assignmentRes.json();
      localStorage.setItem(`assignment_${courseId}`, assignment.id);

      for (const question of questions) {
        const questionRes = await fetch(`/api/assignments/${assignment.id}/question`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ question_text: question.question_text }),
        });

        const createdQuestion = await questionRes.json();

        await fetch(`/api/assignments/question/${createdQuestion.id}/options`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ options: question.options }),
        });
      }

      toast.success("Assessment created successfully");
      notifyUpdate();
      navigate("/instructor/assignments");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user || user.role !== "instructor") {
      navigate("/login", { replace: true });
    }
  }, []);

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
          <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Create Assessment</h1>
          </header>

          <main className="p-6 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Passing Percentage (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentData.passing_percentage}
                    onChange={(e) => setAssignmentData({ ...assignmentData, passing_percentage: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={limitAttempts} onChange={() => setLimitAttempts(!limitAttempts)} />
                  <span>Limit Attempts</span>
                </div>

                {limitAttempts && (
                  <Input
                    type="number"
                    placeholder="Max Attempts"
                    value={assignmentData.max_attempts ?? ""}
                    onChange={(e) => setAssignmentData({ ...assignmentData, max_attempts: Number(e.target.value) })}
                  />
                )}
              </CardContent>
            </Card>

            {questions.map((q, qIndex) => (
              <Card key={qIndex}>
                <CardContent className="p-6 space-y-4">
                  <Input
                    placeholder={`Question ${qIndex + 1}`}
                    value={q.question_text}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIndex].question_text = e.target.value;
                      setQuestions(updated);
                    }}
                  />
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input type="radio" name={`correct-${qIndex}`} checked={option.is_correct} onChange={() => handleCorrectOption(qIndex, oIndex)} />
                      <Input
                        placeholder={`Option ${oIndex + 1}`}
                        value={option.option_text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].options[oIndex].option_text = e.target.value;
                          setQuestions(updated);
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Button onClick={addQuestion} variant="outline">
              <Plus className="mr-2 h-4 w-4" />Add Question
            </Button>

            <Button onClick={handleCreateAssignment} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500">
              Create Assessment
            </Button>
          </main>
        </div>
      </div>
      <AIAssistant/>
    </div>
  );
}