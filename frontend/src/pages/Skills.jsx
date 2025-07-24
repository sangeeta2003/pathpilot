import React, { useState } from "react";

export default function Skills() {
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Helper to parse comma-separated skills
  const parseSkills = (str) => str.split(",").map((s) => s.trim()).filter(Boolean);

  // Update user skills in backend
  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    setMessage("");
    setMatches([]);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          skillsOffered: parseSkills(skillsOffered),
          skillsWanted: parseSkills(skillsWanted),
        }),
      });
      if (res.ok) {
        setMessage("Skills updated! Now find your matches.");
      } else {
        setMessage("Failed to update skills.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // Find matches
  const handleFindMatches = async () => {
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(data);
        if (data.length === 0) setMessage("No matches found. Try updating your skills!");
      } else {
        setMessage("Failed to find matches.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // Request a swap
  const handleRequestSwap = async (responderId, skill) => {
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swaps/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ responderId, skill }),
      });
      if (res.ok) {
        setMessage("Swap requested!");
      } else {
        setMessage("Failed to request swap.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-indigo-800 mb-4">Skill Matching</h1>
        <form onSubmit={handleUpdateSkills} className="mb-6">
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Skills You Offer (comma separated)</label>
            <input
              type="text"
              value={skillsOffered}
              onChange={(e) => setSkillsOffered(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. JavaScript, Guitar, Python"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Skills You Want to Learn (comma separated)</label>
            <input
              type="text"
              value={skillsWanted}
              onChange={(e) => setSkillsWanted(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Figma, React, Piano"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            disabled={loading}
          >
            Update Skills
          </button>
        </form>
        <button
          onClick={handleFindMatches}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition mb-6"
          disabled={loading}
        >
          Find Matches
        </button>
        {message && <div className="mb-4 text-center text-indigo-700">{message}</div>}
        {loading && <div className="mb-4 text-center">Loading...</div>}
        {matches.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-indigo-700 mb-2">Matching Users</h2>
            <ul>
              {matches.map((user) => (
                <li key={user._id} className="mb-4 p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-indigo-800">{user.name}</div>
                    <div className="text-gray-600 text-sm">{user.email}</div>
                    <div className="text-gray-700 text-sm mt-1">Offers: {user.skillsOffered.join(", ")}</div>
                    <div className="text-gray-700 text-sm">Wants: {user.skillsWanted.join(", ")}</div>
                    {user.bio && <div className="text-gray-500 text-xs mt-1">{user.bio}</div>}
                  </div>
                  <button
                    onClick={() => handleRequestSwap(user._id, user.skillsOffered[0])}
                    className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    Request Swap
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 