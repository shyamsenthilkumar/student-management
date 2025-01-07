import React, { useState } from 'react';  // Importing useState
import axios from 'axios';  // Importing axios

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const createTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/create-teacher', 
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Teacher created successfully');
    } catch (error) {
      alert('Failed to create teacher');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">Create Teacher Account</h3>
        <form onSubmit={createTeacher}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Teacher
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
