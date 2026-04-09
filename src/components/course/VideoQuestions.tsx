import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
type Choice = {
    id: number;
    choice_text: string;
};

type Question = {
    id: number;
    question_text: string;
    choices: Choice[];
};

type Props = {
    videoId: number;
};

export default function VideoQuestions({ videoId }: Props) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [results, setResults] = useState<Record<number, boolean>>({});
    const [lockedQuestions, setLockedQuestions] = useState<Record<number, boolean>>({});
    const [currentIndex, setCurrentIndex] = useState(0);

    /* ================= Fetch Questions ================= */
    useEffect(() => {
        fetchQuestions();
        setCurrentIndex(0);
        setAnswers({});
        setResults({});
        setLockedQuestions({});
    }, [videoId]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `${API_URL}/api/videos/${videoId}/questions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            setQuestions(data);
        } catch {
            setError("Could not load questions");
        } finally {
            setLoading(false);
        }
    };

    /* ================= Submit Answer ================= */
    const submitAnswer = async (questionId: number, choiceId: number) => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(
                `${API_URL}/api/questions/${questionId}/answer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ choice_id: choiceId }),
                }
            );

            const data = await res.json();

            setResults(prev => ({
                ...prev,
                [questionId]: data.correct,
            }));

            // لو صح → اقفل السؤال
            if (data.correct) {
                setLockedQuestions(prev => ({
                    ...prev,
                    [questionId]: true,
                }));
            }
        } catch {
            // silent fail (UX أفضل)
        }
    };

    /* ================= UI States ================= */
    if (loading) return <p>Loading questions...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (questions.length === 0) {
        return (
                <p className="text-gray-500 text-center">
                    There are no questions for this video!
                </p>
        );
    }


    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    /* ================= UI ================= */
    return (
        <div className="max-w-xl mx-auto">
            {/* Counter */}
            <p className="text-sm text-gray-500 mb-3">
                Question {currentIndex + 1} of {totalQuestions}
            </p>

            {/* Question Card */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-base font-medium mb-4">
                    {currentQuestion.question_text}
                </p>

                {/* Choices */}
                <div className="space-y-3">
                    {currentQuestion.choices.map(choice => {
                        const isSelected =
                            answers[currentQuestion.id] === choice.id;

                        const isLocked =
                            lockedQuestions[currentQuestion.id];

                        const isCorrect =
                            isSelected && results[currentQuestion.id] === true;

                        const isWrong =
                            isSelected && results[currentQuestion.id] === false;

                        return (
                            <button
                                key={choice.id}
                                disabled={isLocked}
                                onClick={() => {
                                    if (isLocked) return;

                                    setAnswers(prev => ({
                                        ...prev,
                                        [currentQuestion.id]: choice.id,
                                    }));

                                    submitAnswer(currentQuestion.id, choice.id);
                                }}
                                className={`
                  w-full text-left px-4 py-3 rounded-lg border transition
                  ${isCorrect
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : isWrong
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : isLocked
                                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "border-gray-200 hover:bg-gray-50"
                                    }
                `}
                            >
                                {choice.choice_text}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {results[currentQuestion.id] === true && (
                    <p className="mt-4 text-sm text-green-600">
                        Correct answer.
                    </p>
                )}

                {results[currentQuestion.id] === false && (
                    <p className="mt-4 text-sm text-red-600">
                        Incorrect answer. Try again.
                    </p>
                )}

                {/* Next Question */}
                {lockedQuestions[currentQuestion.id] &&
                    currentIndex < totalQuestions - 1 && (
                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="
    mt-6 w-full py-3 rounded-xl
    text-white font-medium
    bg-gradient-to-r from-violet-600 to-cyan-500
    transition
  "
                        >
                            Next Question
                        </button>

                    )}
            </div>
        </div>
    );
}
