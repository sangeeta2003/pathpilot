import React, { useEffect, useState } from "react";

function getToken() {
  return localStorage.getItem("token");
}

export default function DSA() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [progress, setProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [solutionInput, setSolutionInput] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [language, setLanguage] = useState("python");

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/api/dsa");
        if (!res.ok) throw new Error("Failed to fetch problems");
        const data = await res.json();
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Could not load DSA problems.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const token = getToken();
        if (!token) return setProgress([]);
        const res = await fetch("http://localhost:5000/api/dsa/progress", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProgress(Array.isArray(data.progress) ? data.progress : []);
      } catch {
        setProgress([]);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const getStatus = (id) => {
    const entry = progress.find((p) => p.problem && p.problem._id === id);
    return entry ? entry.status : null;
  };

  const handleMark = async (id, status) => {
    setActionMsg("");
    try {
      const token = getToken();
      if (!token) {
        setActionMsg("Login required to track progress.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/dsa/${id}/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProgress((prev) => {
        // Remove any existing entry for this problem
        const filtered = prev.filter((p) => p.problem && p.problem._id !== id);
        // Add new entry
        return [...filtered, { problem: { _id: id }, status, lastAttempt: new Date() }];
      });
      setActionMsg(data.message);
    } catch (err) {
      setActionMsg(err.message || "Failed to update progress.");
    }
  };

  const handleSelect = async (id) => {
    setSelected(id);
    setDetail(null);
    try {
      const res = await fetch(`http://localhost:5000/api/dsa/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetail(data.problem);
    } catch {
      setDetail({ error: "Failed to load problem details." });
    }
  };

  const handleSubmitSolution = async () => {
    setCheckResult(null);
    setActionMsg("");
    try {
      const token = getToken();
      if (!token) {
        setActionMsg("Login required to submit solution.");
        return;
      }
      const res = await fetch(`http://localhost:5000/api/dsa/${detail._id}/solve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ code: solutionInput, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCheckResult(data);
      setProgress((prev) => {
        const filtered = prev.filter((p) => p.problem && p.problem._id !== detail._id);
        return [...filtered, { problem: { _id: detail._id }, status: data.allPassed ? "solved" : "bookmarked", lastAttempt: new Date() }];
      });
    } catch (err) {
      setActionMsg(err.message || "Failed to check solution.");
    }
  };

  const solvedCount = (Array.isArray(progress) ? progress : []).filter((p) => p.status === "solved").length;
  const bookmarkedCount = (Array.isArray(progress) ? progress : []).filter((p) => p.status === "bookmarked").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-3">DSA Practice</h1>
        <p className="text-lg text-gray-700 mb-4">Solve curated Data Structures & Algorithms problems. Filter by topic and track your progress!</p>
        <div className="flex justify-center gap-6 mb-4">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">Solved: {solvedCount}</span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-sm">Bookmarked: {bookmarkedCount}</span>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-lg font-bold text-indigo-700 mb-4">Problem List</h2>
        {loading ? (
          <div className="text-indigo-600">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ul className="divide-y divide-indigo-50">
            {Array.isArray(problems) ? problems.map((p) => (
              <li key={p._id} className="py-3 flex items-center gap-4 cursor-pointer hover:bg-indigo-50 rounded" onClick={() => handleSelect(p._id)}>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.difficulty}</span>
                <span className="flex-1 text-indigo-900 font-semibold">{p.title}</span>
                <span className="text-xs text-gray-500">{p.tags && p.tags.join(', ')}</span>
                {progressLoading ? null : getStatus(p._id) === "solved" ? (
                  <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Solved</span>
                ) : getStatus(p._id) === "bookmarked" ? (
                  <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">Bookmarked</span>
                ) : null}
              </li>
            )) : null}
          </ul>
        )}
      </div>
      {detail && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl mt-6 text-left">
          {detail.error ? (
            <div className="text-red-500">{detail.error}</div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-indigo-800 mb-2">{detail.title}
                {detail.link && (
                  <a
                    href={`https://leetcode.com/problems/${detail.link.replace(/\/$/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline ml-2 text-base font-normal"
                  >
                    View on LeetCode
                  </a>
                )}
              </h3>
              <div className="mb-2 text-sm text-gray-500">Difficulty: <span className={`font-bold ${detail.difficulty === 'Easy' ? 'text-green-700' : detail.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'}`}>{detail.difficulty}</span></div>
              <div className="mb-2 text-sm text-gray-500">Tags: {detail.tags && detail.tags.join(', ')}</div>
              <div className="mb-4 text-gray-800 whitespace-pre-wrap">{detail.description}</div>
              <div className="flex gap-4 mb-2">
                <button onClick={() => handleMark(detail._id, "solved")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Mark as Solved</button>
                <button onClick={() => handleMark(detail._id, "bookmarked")} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Bookmark</button>
              </div>
              {/* Solution Submission UI (code) */}
              {detail.testCases && detail.testCases.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-indigo-700 mb-1">Submit Your Code Solution:</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="mb-2 px-2 py-1 rounded border border-indigo-200">
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <textarea
                    className="w-full p-2 border border-indigo-200 rounded mb-2 font-mono"
                    rows={6}
                    value={solutionInput}
                    onChange={e => setSolutionInput(e.target.value)}
                    placeholder="Write your code here..."
                  />
                  <button onClick={handleSubmitSolution} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Submit Solution</button>
                  {checkResult && (
                    <div className="mt-4">
                      <div className={`font-bold mb-2 ${checkResult.allPassed ? 'text-green-700' : 'text-red-500'}`}>{checkResult.allPassed ? 'All test cases passed!' : 'Some test cases failed.'}</div>
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-indigo-50">
                            <th className="p-2 border">Input</th>
                            <th className="p-2 border">Expected</th>
                            <th className="p-2 border">Output</th>
                            <th className="p-2 border">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {checkResult.results.map((r, idx) => (
                            <tr key={idx} className={r.passed ? 'bg-green-50' : 'bg-red-50'}>
                              <td className="p-2 border font-mono">{r.input}</td>
                              <td className="p-2 border font-mono">{r.expected}</td>
                              <td className="p-2 border font-mono">{r.output}</td>
                              <td className="p-2 border font-bold">{r.passed ? 'Passed' : 'Failed'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {/* End Solution Submission UI */}
              {actionMsg && <div className={`mb-2 ${actionMsg.includes('marked') ? 'text-green-700' : 'text-red-500'}`}>{actionMsg}</div>}
              {detail.solution && <details className="mt-2"><summary className="cursor-pointer text-indigo-600 font-semibold">Show Solution</summary><div className="mt-2 bg-indigo-50 p-3 rounded text-gray-800 whitespace-pre-wrap">{detail.solution}</div></details>}
            </>
          )}
        </div>
      )}
    </div>
  );
}