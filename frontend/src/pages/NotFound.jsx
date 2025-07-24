import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-6xl font-bold text-indigo-800 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Page not found.</p>
      <Link
        to="/"
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}