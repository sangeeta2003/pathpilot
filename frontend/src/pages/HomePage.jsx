import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "AI-Powered Roadmaps",
    desc: "Personalized learning paths based on your resume and dream job.",
  },
  {
    title: "DSA & Mock Interviews",
    desc: "Practice with curated coding questions and real interview scenarios.",
  },
  {
    title: "Project & Progress Tracker",
    desc: "Track your growth, bookmark questions, and showcase your projects.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Hero Section */}
      <header className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-800 mb-4">
          PathPilot
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">
          Your AI-powered career co-pilot for FAANG prep.<br />
          Get personalized roadmaps, DSA practice, and project ideas—driven by your resume.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Get Started
        </Link>
      </header>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-indigo-700 mb-8 text-center">
            Why PathPilot?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-indigo-50 rounded-xl p-6 shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} PathPilot. All rights reserved.
      </footer>
    </div>
  );
}