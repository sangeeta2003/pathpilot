import React from "react";

export default function Profile() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">Your Profile</h1>
        <p className="text-gray-700">
          View and update your info, add your GitHub/LeetCode, or reset your password.
        </p>
      </div>
    </div>
  );
}