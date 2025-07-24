import React, { useEffect, useState, useRef } from "react";

function SkillSwapAIChat({ userOffers, userProfile }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your Skill Swap AI assistant. I can help you write better skill offers, suggest what to learn next, or guide you through the swap process. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          system: "You are a helpful assistant for a Skill Swap platform. Help users write better skill offers/requests, suggest what to learn next based on their background, and guide them through the swap process.",
          context: {
            offers: userOffers,
            profile: userProfile
          }
        }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: data.reply || "Sorry, I couldn't understand that." }
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Sorry, there was an error. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-green-700 transition"
        aria-label="Open Skill Swap AI Chatbot"
      >
        🤝
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl flex flex-col">
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
            <span className="font-bold">Skill Swap AI</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">&times;</button>
          </div>
          <div className="p-4 h-80 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.from === "user"
                      ? "bg-green-100 text-green-900"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex border-t">
            <input
              className="flex-1 px-3 py-2 rounded-bl-xl outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Skill Swap AI..."
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-br-xl hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function SkillSwap() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({
    offer: "",
    request: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:5000/api/skillswap", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) throw new Error("Failed to fetch skill swaps");
        const data = await res.json();
        setOffers(Array.isArray(data.offers) ? data.offers : []);
      } catch (err) {
        setError("Could not load skill swaps.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOffers();
  }, [token]);

  useEffect(() => {
    // Fetch user profile/resume data for context-aware AI
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ai/resume-data", {
          headers: { Authorization: "Bearer " + token },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUserProfile(data.resumeData || null);
      } catch {}
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.offer.trim() || !form.request.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/skillswap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add skill swap");
      const { skillSwap } = await res.json();
      setOffers((prev) => [skillSwap, ...prev]);
      setForm({ offer: "", request: "" });
      setShowForm(false);
    } catch {
      setError("Could not add skill swap.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill swap offer?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/skillswap/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error();
      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch {
      setError("Could not delete skill swap.");
    }
  };

  // Only pass the current user's offers as context
  const userOffers = offers.filter(o => o.user && o.user._id === userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">Skill Swap</h1>
        <p className="text-gray-600 mb-6">Offer a skill you can teach and request a skill you want to learn. Find a peer to swap knowledge and grow together!</p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <button
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "Offer a Skill Swap"}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col gap-3">
            <input
              className="border rounded px-3 py-2"
              name="offer"
              value={form.offer}
              onChange={handleChange}
              placeholder="Skill you can offer (e.g. React, SQL)"
              required
            />
            <input
              className="border rounded px-3 py-2"
              name="request"
              value={form.request}
              onChange={handleChange}
              placeholder="Skill you want to learn (e.g. System Design)"
              required
            />
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" type="submit">
              Add Swap Offer
            </button>
          </form>
        )}
        <div>
          {loading ? (
            <div className="text-indigo-600 text-center">Loading...</div>
          ) : offers.length === 0 ? (
            <div className="text-gray-500 text-center">No skill swaps yet. Offer your first swap!</div>
          ) : (
            <ul className="space-y-4">
              {offers.map((swap) => (
                <li key={swap._id} className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="font-semibold text-indigo-700">Offer:</span> {swap.offer}
                    <br />
                    <span className="font-semibold text-green-700">Wants:</span> {swap.request}
                    <br />
                    <span className="text-xs text-gray-400">By: {swap.user?.name || 'User'}</span>
                  </div>
                  {swap.user && swap.user._id === userId && (
                    <button
                      className="mt-3 md:mt-0 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={() => handleDelete(swap._id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <SkillSwapAIChat userOffers={userOffers} userProfile={userProfile} />
    </div>
  );
} 