import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashBoard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Greeting */}
        <h1 className="text-3xl font-bold text-indigo-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mb-8">
          Here’s your FAANG prep dashboard. Keep up the great work!
        </p>

        {/* Progress Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-2/3">
            <h2 className="text-lg font-semibold text-indigo-700 mb-2">Your Progress</h2>
            <div className="w-full bg-indigo-100 rounded-full h-4 mb-2">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${user.progress || 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-700">{user.progress || 0}% complete</span>
          </div>
          <div className="mt-4 md:mt-0 md:ml-8">
            <span className="inline-block bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
              Current Stage: {user.roadmapStage || "-"}
            </span>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">Your Badges</h2>
          {user.badges && user.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, idx) => (
                <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs">
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No badges yet. Start taking or creating quizzes!</div>
          )}
        </div>

        {/* Quiz Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
            <span className="text-2xl font-bold text-indigo-700">{user.stats?.quizzesCreated || 0}</span>
            <span className="text-gray-600 mt-1">Quizzes Created</span>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
            <span className="text-2xl font-bold text-indigo-700">{user.stats?.quizzesTaken || 0}</span>
            <span className="text-gray-600 mt-1">Quizzes Taken</span>
          </div>
          <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
            <span className="text-2xl font-bold text-indigo-700">{user.stats?.avgAccuracy ? `${user.stats.avgAccuracy}%` : '-'}</span>
            <span className="text-gray-600 mt-1">Avg. Accuracy</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4">Recent Activity</h2>
          {user.recentActivity && user.recentActivity.length > 0 ? (
            <ul className="divide-y divide-indigo-50">
              {user.recentActivity.map((act, idx) => (
                <li key={idx} className="py-2 flex items-center gap-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${act.type === 'quiz' ? 'bg-indigo-100 text-indigo-700' : act.type === 'badge' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{act.type}</span>
                  <span className="flex-1 text-gray-800">{act.description}</span>
                  <span className="text-gray-400 text-xs">{new Date(act.date).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No recent activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}