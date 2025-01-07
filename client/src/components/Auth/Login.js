import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', // Change 'username' to 'email'
    password: '',
    role: 'admin',
  });
  const [error, setError] = useState(''); // To display error messages
  const [loading, setLoading] = useState(false); // To manage loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.email || !formData.password) {  // Check for 'email' instead of 'username'
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true); // Start loading

      const res = await axios.post('http://localhost:5000/api/auth/login', formData);

      // Store token and redirect to the appropriate dashboard based on role
      localStorage.setItem('token', res.data.token);
      navigate(`/${formData.role}-dashboard`);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false); // Stop loading after the request finishes
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        
        {/* Display any error message */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <select
            className="w-full p-2 mb-4 border rounded"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            value={formData.role}
          >
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>

          <input
            type="email"  // Change 'text' to 'email'
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={formData.email}  // Bind to 'email'
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Logging in...' : 'Login'} {/* Show loading text */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
