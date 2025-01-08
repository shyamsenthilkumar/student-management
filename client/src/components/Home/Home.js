import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to the Student Monitoring System
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Please log in or register to access your dashboard and start managing your academic journey.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="py-3 px-6 bg-blue-500 text-white text-lg font-semibold rounded hover:bg-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="py-3 px-6 bg-green-500 text-white text-lg font-semibold rounded hover:bg-green-600 transition"
          >
            Register
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-gray-500 text-sm">
          <p>
            Need assistance? Visit our{" "}
            <Link to="/help" className="text-blue-500 hover:underline">
              Help Center
            </Link>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
