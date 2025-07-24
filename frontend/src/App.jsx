import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashBoard";
import Navbar from "./components/Navbar";
import Roadmap from "./pages/Roadmap";
import DSA from "./pages/DSA";
import Projects from "./pages/Projects";
import MockInterview from "./pages/MockInterview";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Skills from "./pages/Skills";
import Swaps from "./pages/Swaps";
import QuizBuilder from "./pages/QuizBuilder";
import Leaderboard from "./pages/Leaderboard";
import SkillSwap from "./pages/SkillSwap";
import PublicProfile from "./pages/PublicProfile";
import AIChatbot from "./components/AIChatbot";
// ...other imports

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Add more routes as you create more pages */}
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dsa" element={<DSA />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/mockinterview" element={<MockInterview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/swaps" element={<Swaps />} />
        <Route path="/quiz-builder" element={<QuizBuilder />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/skill-swap" element={<SkillSwap />} />
        {/* <Route path="/profile/:username" element={<PublicProfile />} />  */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIChatbot />
    </Router>
  );
}

export default App;