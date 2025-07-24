import React, { useState, useRef } from "react";

export default function Roadmap() {
  const [input, setInput] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [recommendedProblems, setRecommendedProblems] = useState([]);
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRoadmap("");
    setCopied(false);
    try {
      const res = await fetch("http://localhost:5000/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to generate roadmap");
      } else {
        const data = await res.json();
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roadmap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setInput("");
    setRoadmap("");
    setCopied(false);
    setRecommendedProblems([]);
    setPdfInfo({ name: file.name, size: file.size });
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to parse resume");
      } else {
        const data = await res.json();
        setInput(data.text);
        setRecommendedProblems(data.recommendedProblems || []);
      }
    } catch (err) {
      setError("Failed to upload or parse PDF. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag-and-drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleRemovePdf = () => {
    setPdfInfo(null);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10 flex flex-col items-center">
      {/* Hero Section */}
      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-3">AI-Powered Roadmap Generator</h1>
        <p className="text-lg text-gray-700 mb-4">Paste your resume, skills, or describe your career goal to get a personalized learning roadmap powered by AI.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-indigo-700 mb-2">
          <span className="bg-indigo-100 px-3 py-1 rounded-full">1. Paste your info or upload PDF</span>
          <span className="hidden md:inline">→</span>
          <span className="bg-indigo-100 px-3 py-1 rounded-full">2. Click Generate</span>
          <span className="hidden md:inline">→</span>
          <span className="bg-indigo-100 px-3 py-1 rounded-full">3. Get your roadmap!</span>
        </div>
      </div>
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl mb-6">
        {/* Drag-and-drop PDF upload */}
        <div
          className={`flex flex-col md:flex-row gap-4 mb-4 items-center justify-center border-2 border-dashed rounded-lg transition ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200 bg-white'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full md:w-auto text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
            disabled={uploading || loading}
            style={{ display: dragActive ? 'none' : undefined }}
          />
          <div className="flex flex-col items-center w-full py-2">
            <span className="text-indigo-700 text-sm mb-1">Drag & drop PDF here or click to select</span>
            {uploading && (
              <span className="text-indigo-600 flex items-center gap-1 text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Parsing PDF...
              </span>
            )}
            {pdfInfo && !uploading && (
              <div className="flex items-center gap-2 mt-2 bg-indigo-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="text-indigo-700 text-xs font-semibold">{pdfInfo.name} ({(pdfInfo.size / 1024).toFixed(1)} KB)</span>
                <button type="button" onClick={handleRemovePdf} className="ml-2 text-xs text-red-500 hover:underline">Remove</button>
              </div>
            )}
          </div>
        </div>
        <textarea
          className="w-full p-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4 resize-none transition"
          rows={6}
          placeholder="Paste your resume, skills, or describe your career goal..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition flex items-center justify-center"
          disabled={loading || uploading}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </form>
      {/* Recommended DSA Problems */}
      {recommendedProblems.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mt-6">
          <h2 className="text-lg font-bold text-indigo-700 mb-4">Recommended DSA Problems for You</h2>
          <ul className="divide-y divide-indigo-50">
            {recommendedProblems.map((p) => (
              <li key={p._id} className="py-3 flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.difficulty}</span>
                <span className="flex-1 text-indigo-900 font-semibold">{p.title}</span>
                <span className="text-xs text-gray-500">{p.tags && p.tags.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Roadmap Display */}
      {roadmap && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mt-2 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-indigo-700">Your Personalized Roadmap</h2>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition ${copied ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm text-left overflow-x-auto">{roadmap}</pre>
        </div>
      )}
    </div>
  );
}