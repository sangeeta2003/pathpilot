import React, { useEffect, useState } from "react";

export default function Swaps() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [endorseData, setEndorseData] = useState({});

  const fetchSwaps = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swaps`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSwaps(data);
      } else {
        setMessage("Failed to fetch swaps.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  // UI: status color
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Endorse a swap
  const handleEndorse = async (swapId) => {
    const { comment, rating } = endorseData[swapId] || {};
    if (!comment || !rating) {
      setMessage("Please provide a comment and rating.");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swaps/${swapId}/endorse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ comment, rating }),
      });
      if (res.ok) {
        setMessage("Swap endorsed!");
        fetchSwaps();
      } else {
        setMessage("Failed to endorse swap.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel a swap (simulate by setting status to cancelled)
  const handleCancel = async (swapId) => {
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swaps/${swapId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setMessage("Swap cancelled.");
        fetchSwaps();
      } else {
        setMessage("Failed to cancel swap.");
      }
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  // Handle endorse form input
  const handleEndorseInput = (swapId, field, value) => {
    setEndorseData((prev) => ({ ...prev, [swapId]: { ...prev[swapId], [field]: value } }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-indigo-800 mb-4">Your Swaps</h1>
        {message && <div className="mb-4 text-center text-indigo-700">{message}</div>}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : swaps.length === 0 ? (
          <div className="text-center text-gray-600">No swaps yet. Request a swap from the Skills page!</div>
        ) : (
          <ul>
            {swaps.map((swap) => (
              <li
                key={swap._id}
                className="mb-4 p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold text-indigo-800">
                    {swap.requester?.name} ↔ {swap.responder?.name}
                  </div>
                  <div className="text-gray-700 text-sm">
                    Skill: <span className="font-medium">{swap.skill}</span>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${statusColor(swap.status)}`}>
                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                  </div>
                  {swap.endorsement && (
                    <div className="mt-2 text-green-700 text-sm">
                      Endorsed: {swap.endorsement.comment} (Rating: {swap.endorsement.rating})
                    </div>
                  )}
                </div>
                {/* Endorse action */}
                {swap.status === "completed" && !swap.endorsement && (
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <input
                      type="text"
                      placeholder="Comment"
                      className="border px-2 py-1 rounded mr-2"
                      value={endorseData[swap._id]?.comment || ""}
                      onChange={(e) => handleEndorseInput(swap._id, "comment", e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Rating"
                      className="border px-2 py-1 rounded mr-2 w-16"
                      value={endorseData[swap._id]?.rating || ""}
                      onChange={(e) => handleEndorseInput(swap._id, "rating", e.target.value)}
                    />
                    <button
                      onClick={() => handleEndorse(swap._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Endorse
                    </button>
                  </div>
                )}
                {/* Cancel action */}
                {swap.status === "pending" && (
                  <button
                    onClick={() => handleCancel(swap._id)}
                    className="mt-4 md:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 