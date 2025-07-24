import React, { useEffect, useState } from "react";

export default function MockInterview() {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [aiFeedback, setAIFeedback] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [error, setError] = useState("");
  const [resumeDataAvailable, setResumeDataAvailable] = useState(false);
  const [loadingResumeData, setLoadingResumeData] = useState(true);

  useEffect(() => {
    // Fetch parsed resume data on mount
    const fetchResumeData = async () => {
      setLoadingResumeData(true);
      try {
        const res = await fetch("http://localhost:5000/api/ai/resume-data", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResumeDataAvailable(!!data.resumeData);
      } catch {
        setResumeDataAvailable(false);
      } finally {
        setLoadingResumeData(false);
      }
    };
    fetchResumeData();
  }, []);

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUploadAndStart = async () => {
    if (!resume) return setError("Please upload your resume (PDF or DOCX)");
    setUploading(true);
    setError("");
    setAIFeedback("");
    setQuestions([]);
    setCurrent(0);
    setAnswers([]);
    try {
      const fd = new FormData();
      fd.append("resume", resume);
      // Call backend to upload and get questions (fallback: not used if resumeData exists)
      const res = await fetch("http://localhost:5000/api/ai/mockinterview", {
        method: "POST",
        body: fd,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!res.ok) throw new Error("Failed to start AI interview");
      const data = await res.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setInterviewStarted(true);
    } catch (err) {
      setError("Could not start AI interview. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleStartWithResumeData = async () => {
    setUploading(true);
    setError("");
    setAIFeedback("");
    setQuestions([]);
    setCurrent(0);
    setAnswers([]);
    try {
      const res = await fetch("http://localhost:5000/api/ai/mockinterview", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (!res.ok) throw new Error("Failed to start AI interview");
      const data = await res.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setInterviewStarted(true);
    } catch (err) {
      setError("Could not start AI interview. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    const userAnswer = answer;
    setAnswers((prev) => [...prev, { question: questions[current], answer: userAnswer }]);
    setAnswer("");
    setAIFeedback("");
    // Optionally, get AI feedback for the answer
    try {
      const res = await fetch("http://localhost:5000/api/ai/interview-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          question: questions[current],
          answer: userAnswer,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAIFeedback(data.feedback || "");
      }
    } catch {}
    setCurrent((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">AI Mock Interview</h1>
        <p className="text-gray-600 mb-6">Upload your resume or use your scanned resume to get personalized interview questions from AI. Answer them one by one and get instant feedback!</p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loadingResumeData ? (
          <div className="text-indigo-600 mb-4">Checking for scanned resume...</div>
        ) : resumeDataAvailable ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mb-6"
            onClick={handleStartWithResumeData}
            disabled={uploading}
          >
            {uploading ? "Starting..." : "Start AI Interview with Scanned Resume"}
          </button>
        ) : (
          <>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className="mb-4"
            />
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              onClick={handleUploadAndStart}
              disabled={uploading}
            >
              {uploading ? "Starting..." : "Start AI Interview"}
            </button>
          </>
        )}
        {interviewStarted && questions.length > 0 && current < questions.length && (
          <form onSubmit={handleAnswerSubmit} className="mt-6">
            <div className="mb-4">
              <span className="text-lg font-semibold text-indigo-700">Question {current + 1} of {questions.length}:</span>
              <div className="mt-2 text-gray-800">{questions[current]}</div>
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 mb-2"
              rows={4}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              required
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              type="submit"
            >
              Submit Answer
            </button>
            {aiFeedback && (
              <div className="mt-4 bg-indigo-50 p-3 rounded text-indigo-700">AI Feedback: {aiFeedback}</div>
            )}
          </form>
        )}
        {interviewStarted && current >= questions.length && (
          <div className="mt-6 text-center">
            <div className="text-xl font-bold text-green-700 mb-2">Interview Complete!</div>
            <div className="mb-4">You answered all questions. Review your answers below:</div>
            <ul className="space-y-3">
              {answers.map((a, idx) => (
                <li key={idx} className="bg-indigo-50 rounded p-3">
                  <div className="font-semibold text-indigo-700">Q: {a.question}</div>
                  <div className="text-gray-800 mt-1">A: {a.answer}</div>
                </li>
              ))}
            </ul>
            <button
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              onClick={() => {
                setInterviewStarted(false);
                setQuestions([]);
                setCurrent(0);
                setAnswers([]);
                setAIFeedback("");
                setResume(null);
              }}
            >
              Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}