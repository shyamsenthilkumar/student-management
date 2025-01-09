import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'teacher' // Added role field
    });
    
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [newClassroom, setNewClassroom] = useState({
        standard: '',
        section: '',
        teacherId: '',
        roomNumber: '',
        capacity: ''
    });
    
    useEffect(() => {
        fetchTeachers();
        fetchClassrooms();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('apiKey');
            if (!token) {
                alert('Please log in first');
                window.location.href = '/login';
                return;
            }
    
            const response = await axios.get('http://localhost:5000/api/auth/admin/get-teachers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            setTeachers(response.data.teachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('apiKey');
                window.location.href = '/login';
            }
            alert(error.response?.data?.message || 'Failed to fetch teachers');
        }
    };
  
  
  


  useEffect(() => {
      fetchTeachers(); // Fetch teachers when the component mounts
      fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
        const token = localStorage.getItem('apiKey');
        const response = await axios.get('http://localhost:5000/api/classrooms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        setClassrooms(response.data);
    } catch (error) {
        console.error('Failed to fetch classrooms:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('apiKey');
            window.location.href = '/login';
        }
        alert(error.response?.data?.message || 'Error fetching classrooms');
    }
};

    const createTeacher = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('apiKey');  // Get the token from localStorage
          
          // Get the role from the form or default to 'teacher'
          const role = 'teacher';  // This can be changed dynamically if needed (e.g., for admins)
  
          // Make POST request to create teacher
          await axios.post(
              'http://localhost:5000/api/auth/admin/create-teacher',
              {
                  name: formData.name,
                  email: formData.email,
                  password: formData.password,
                  role: role  // Include role in the request body
              },
              {
                  headers: {
                      'Authorization': `Bearer ${token}`  // Pass the token in Authorization header
                  }
              }
          );
          
          alert('Teacher created successfully');
          setFormData({ name: '', password: '', email: '' });  // Clear the form
          fetchTeachers();  // Fetch updated list of teachers
      } catch (error) {
          alert(error.response?.data?.message || 'Failed to create teacher');
      }
  };
  useEffect(() => {
    fetchTeachers();
}, []);


const createClassroom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('apiKey');
    
    // Validate all required fields
    if (!newClassroom.standard || !newClassroom.section || 
        !newClassroom.roomNumber || !newClassroom.capacity) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        // Check if token exists
        if (!token) {
            alert('Not authenticated. Please log in.');
            window.location.href = '/login'; // Redirect to login page
            return;
        }

        // Prepare request payload and headers
        const response = await axios.post(
            'http://localhost:5000/api/auth/admin/classrooms',
            {
                standard: newClassroom.standard.trim(),
                section: newClassroom.section.trim().toUpperCase(),
                roomNumber: newClassroom.roomNumber.trim(),
                capacity: parseInt(newClassroom.capacity),
                teacherId: newClassroom.teacherId || undefined, // Optional if the teacher is auto-assigned
                students: newClassroom.students // Send selected students
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Handle successful response
        if (response.status === 201) {
            alert('Classroom created successfully');
            
            // Reset form fields
            setNewClassroom({
                standard: '',
                section: '',
                teacherId: '',
                roomNumber: '',
                capacity: '',
                students: []
            });

            // Refresh classroom list
            await fetchClassrooms();
        }
    } catch (error) {
        console.error('Error details:', error.response?.data);

        // Error handling based on status code
        switch (error.response?.status) {
            case 400:
                alert(error.response.data.message || 'Invalid classroom data. Please check your inputs.');
                break;
            case 401:
                alert('Session expired. Please log in again.');
                localStorage.removeItem('apiKey');
                window.location.href = '/login'; // Redirect to login page
                break;
            case 403:
                alert('You do not have permission to create classrooms. Only teachers and admins can create classrooms.');
                break;
            case 409:
                alert('A classroom with these details already exists.');
                break;
            default:
                alert('Failed to create classroom. Please try again later.');
        }
    }
};
    const updateClassroom = async (id, updates) => {
        try {
            const apiKey = localStorage.getItem('apiKey');
            await axios.put(
                `http://localhost:5000/api/classrooms/${id}`,
                updates,
                {
                    headers: {
                        'X-API-Key': apiKey
                    }
                }
            );
            fetchClassrooms();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update classroom');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            
            {/* Create Teacher Form */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
    <h3 className="text-xl mb-4">Create Teacher Account</h3>
    <form onSubmit={createTeacher} className="space-y-4">
        <input
            type="text"
            placeholder="Username"
            value={formData.name}
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
        />
        <input
            type="password"
            placeholder="Password"
            value={formData.password}
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
        />
        <input
            type="email"
            placeholder="Email"
            value={formData.email}
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
        />
        <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-2 border rounded"
            required
        >
            <option value="teacher">Teacher</option>
        </select>
        <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Create Teacher
        </button>
    </form>
</div>

            {/* Create Classroom Form */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl mb-4">Create Classroom</h3>
        <form onSubmit={createClassroom} className="space-y-4">
            <select
                value={newClassroom.standard}
                onChange={(e) => setNewClassroom({ ...newClassroom, standard: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            >
                <option value="">Select Standard</option>
                {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                        Class {i + 1}
                    </option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Section (e.g., A, B, C)"
                value={newClassroom.section}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setNewClassroom({ ...newClassroom, section: e.target.value.toUpperCase() })}
                required
                maxLength={1}
            />

            <select
                value={newClassroom.teacherId}
                onChange={(e) => setNewClassroom({ ...newClassroom, teacherId: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Class Teacher</option>
                {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                    </option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Room Number"
                value={newClassroom.roomNumber}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setNewClassroom({ ...newClassroom, roomNumber: e.target.value })}
                required
            />

            <input
                type="number"
                placeholder="Capacity"
                value={newClassroom.capacity}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setNewClassroom({ ...newClassroom, capacity: e.target.value })}
                required
                min="1"
                max="100"
            />

            <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Create Classroom
            </button>
        </form>
    </div>

{/* Display Classrooms */}
<h3 className="text-xl mb-4">Classrooms</h3>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {classrooms.map((classroom) => (
    <div key={classroom._id} className="p-4 bg-white rounded-lg shadow">
      <h4 className="text-lg font-bold mb-2">
        Class {classroom.standard}-{classroom.section}
      </h4>
      <p>Room: {classroom.roomNumber}</p>
      <p>Capacity: {classroom.capacity}</p>
      <p>
        Teacher: {teachers.find((t) => t._id === classroom.teacherId)?.username || 'Unassigned'}
      </p>
      <select
        value={classroom.teacherId || ''}
        onChange={(e) => updateClassroom(classroom._id, { teacherId: e.target.value })}
        className="mt-2 w-full p-2 border rounded"
      >
        <option value="">Change Teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher._id}>
            {teacher.username}
          </option>
        ))}
      </select>
    </div>
  ))}
</div>

            
        </div>
    );
};

export default AdminDashboard;