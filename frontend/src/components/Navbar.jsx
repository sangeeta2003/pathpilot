import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-indigo-700">PathPilot</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-6">
            {/* <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Dashboard
            </NavLink> */}
            <NavLink
              to="/roadmap"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Roadmap
            </NavLink>
            <NavLink
              to="/dsa"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              DSA
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/mockinterview"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Mock Interview
            </NavLink>
            <NavLink
              to="/quiz-builder"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Quiz Builder
            </NavLink>
            {/* <NavLink
              to="/skill-swap"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Skill Swap
            </NavLink> */}
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Leaderboard
            </NavLink>
            
            {/* <NavLink
              to="/profile/demo-user"
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              Public Profile
            </NavLink> */}
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium transition"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1 rounded-lg text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}