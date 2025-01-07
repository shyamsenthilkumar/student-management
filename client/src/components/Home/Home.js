import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Student Monitoring System</h1>
        <p className="mb-4">Please log in or register to access your dashboard.</p>
        <div>
          <Link
            to="/login"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4 block text-center"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 block text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
