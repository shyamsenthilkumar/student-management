import React, { useState } from 'react';  // Importing useState
import axios from 'axios';  // Importing axios

const TeacherDashboard = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    type: 'student'
  });

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formData.type === 'student' ? 
        '/api/users/create-student' : 
        '/api/users/create-parent';
      
      await axios.post(`http://localhost:5000${endpoint}`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert(`${formData.type} created successfully`);
    } catch (error) {
      alert(`Failed to create ${formData.type}`);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
      <div className="max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">Create Student/Parent Account</h3>
        <form onSubmit={createUser}>
          <select
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
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
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;
