import React, { useState } from "react";

export default function QuizBuilder() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setQuiz([]);
    setCurrent(0);
    setScore(0);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!Array.isArray(data.quiz) || data.quiz.length === 0) throw new Error();
      setQuiz(data.quiz);
    } catch {
      setError("Could not generate quiz. Try a different topic.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
    setIsCorrect(null);
    setSubmitted(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/ai-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          question: quiz[current].question,
          correctAnswer: quiz[current].correctAnswer,
          userAnswer: answer,
        }),
      });
      const data = await res.json();
      setFeedback(data.feedback || "");
      setIsCorrect(data.isCorrect);
      setSubmitted(true);
      if (data.isCorrect) setScore((s) => s + 1);
    } catch {
      setFeedback("Could not check answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrent((c) => c + 1);
    setAnswer("");
    setFeedback("");
    setIsCorrect(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">AI Quiz</h1>
        <form onSubmit={handleGenerate} className="mb-8 flex gap-3">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g. React, SQL, DSA)"
            disabled={generating || quiz.length > 0}
            required
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            type="submit"
            disabled={generating || quiz.length > 0}
          >
            {generating ? "Generating..." : "Generate Quiz"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {quiz.length > 0 && current < quiz.length && (
          <div className="mb-6">
            <div className="text-lg font-semibold text-indigo-700 mb-2">Question {current + 1} of {quiz.length}:</div>
            <div className="text-gray-800 mb-4">{quiz[current].question}</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className="border rounded px-3 py-2"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Your answer..."
                disabled={loading || submitted}
                required
              />
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                type="submit"
                disabled={loading || submitted}
              >
                {loading ? "Checking..." : submitted ? "Submitted" : "Submit Answer"}
              </button>
            </form>
            {feedback && (
              <div className={`mt-4 p-3 rounded ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                <div className="font-bold mb-1">AI Feedback:</div>
                <div>{feedback}</div>
              </div>
            )}
            {submitted && (
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleNext}
                disabled={current >= quiz.length - 1}
              >
                {current < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
              </button>
            )}
          </div>
        )}
        {quiz.length > 0 && current >= quiz.length && (
          <div className="text-center mt-8">
            <div className="text-2xl font-bold text-green-700 mb-2">Quiz Complete!</div>
            <div className="mb-4">Your Score: <span className="font-bold text-indigo-800">{score} / {quiz.length}</span></div>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              onClick={() => {
                setQuiz([]); setCurrent(0); setScore(0); setTopic("");
              }}
            >
              Start New Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 