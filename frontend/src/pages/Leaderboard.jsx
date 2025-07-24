import React, { useEffect, useState } from "react";

const SKILLS = ["React", "SQL", "Java", "Python", "DSA"];
const PERIODS = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skill, setSkill] = useState("");
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const params = [];
        if (skill) params.push(`skill=${encodeURIComponent(skill)}`);
        if (period) params.push(`period=${encodeURIComponent(period)}`);
        const url = `${import.meta.env.VITE_API_URL}/api/leaderboard${params.length ? "?" + params.join("&") : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      } catch (err) {
        setError("Could not load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [skill, period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-indigo-800 mb-6 text-center">Leaderboard</h1>
        <p className="text-gray-600 mb-8 text-center">Top users ranked by resume score, quiz score, and DSA score. Keep learning and climb the ranks!</p>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <select
            className="px-3 py-2 rounded border border-indigo-200"
            value={skill}
            onChange={e => setSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {SKILLS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded border border-indigo-200"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            {PERIODS.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <div className="text-indigo-600 text-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">#</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Resume</th>
                  <th className="py-2">Quiz</th>
                  <th className="py-2">DSA</th>
                  <th className="py-2">Badges</th>
                  <th className="py-2">Swaps</th>
                  <th className="py-2">Streak</th>
                  <th className="py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => (
                  <tr key={user._id || user.name} className="border-b hover:bg-indigo-50">
                    <td className="py-2 font-bold text-indigo-700 text-center">{idx + 1}</td>
                    <td className="py-2 flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border shadow" />
                      <span className="font-semibold text-indigo-900">{user.name}</span>
                    </td>
                    <td className="py-2 text-center">{user.resumeScore}</td>
                    <td className="py-2 text-center">{user.quizScore}</td>
                    <td className="py-2 text-center">{user.dsaScore}</td>
                    <td className="py-2 text-center">
                      {user.badges && user.badges.length > 0 ? (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                          {user.badges[user.badges.length - 1]}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-2 text-center">{user.swapCount || 0}</td>
                    <td className="py-2 text-center">{user.activityStreak || 0}</td>
                    <td className="py-2 text-center font-bold text-green-700">{user.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 