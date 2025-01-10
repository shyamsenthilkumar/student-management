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
                throw new Error('No authentication token found');
            }

            const response = await axios.get('http://localhost:5000/api/auth/admin/get-teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setTeachers(response.data.teachers);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('apiKey');
                window.location.href = '/login';
            }
            console.error('Failed to fetch teachers');
        }
    };
    function handleError(error) {
    console.error('Error occurred:', error);
    // Add any other error handling logic you need
    return {
        message: 'An error occurred.',
        details: error.message || error
    };
}
  
  
  


  useEffect(() => {
      fetchTeachers(); // Fetch teachers when the component mounts
      fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
        const token = localStorage.getItem('apiKey');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/auth/admin/fetch-classrooms', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Map over the classrooms to populate teacher data
        const classroomsWithTeachers = await Promise.all(response.data.map(async (classroom) => {
            if (classroom.teacherId) {
                try {
                    const teacherResponse = await axios.get(`http://localhost:5000/api/auth/admin/teacher/${classroom.teacherId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    return { ...classroom, teacher: teacherResponse.data };
                } catch (error) {
                    console.error(`Error fetching teacher for classroom ${classroom._id}:`, error);
                    return classroom;
                }
            }
            return classroom;
        }));

        setClassrooms(classroomsWithTeachers);
    } catch (error) {
        console.error('Failed to fetch classrooms:', error);
        console.error('Failed to fetch classrooms');
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
    
    if (!newClassroom.standard || !newClassroom.section || 
        !newClassroom.roomNumber || !newClassroom.capacity || !newClassroom.teacherId) {
        alert('Please fill in all required fields, including the teacher assignment');
        return;
    }
    
    try {
        if (!token) {
            alert('Not authenticated. Please log in.');
            window.location.href = '/login';
            return;
        }
        
        const response = await axios.post(
            'http://localhost:5000/api/auth/admin/classrooms',
            {
                standard: newClassroom.standard.trim(),
                section: newClassroom.section.trim().toUpperCase(),
                roomNumber: newClassroom.roomNumber.trim(),
                capacity: parseInt(newClassroom.capacity),
                teacherId: newClassroom.teacherId, // Send teacherId instead of teacherName
                students: newClassroom.students
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.status === 201) {
            alert('Classroom created successfully');
            
            setNewClassroom({
                standard: '',
                section: '',
                teacherId: '', // Changed from teacherName to teacherId
                roomNumber: '',
                capacity: '',
                students: []
            });
            
            await fetchClassrooms();
        }
    } catch (error) {
        console.error('Error details:', error.response?.data);
        handleError(error);
    }
};

const updateClassroom = async (id, updates) => {
    try {
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey) {
            alert('No authentication token found');
            return;
        }

        console.log("Classroom ID:", id);
        console.log("Updates:", updates);

        // Check if the teacherId is selected before making the update
        if (!updates.teacherId || updates.teacherId === '') {
            alert('Please select a teacher');
            return;
        }

        // Send the PUT request to update the classroom
        const response = await axios.put(
            `http://localhost:5000/api/auth/admin/update-classrooms/${id}`,
            updates,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                }
            }
        );
        console.log('Classroom updated:', response.data);

        // After updating, fetch the classrooms again to refresh the UI
        fetchClassrooms();
    } catch (error) {
        console.error("Error during update:", error.response);
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
                    Teacher: {classroom.teacherId?.name || 'Unassigned'}
                </p>
                <select
    value={classroom.teacherId || ''} // Default to empty if no teacher is assigned
    onChange={(e) => updateClassroom(classroom._id, { teacherId: e.target.value })}
    className="mt-2 w-full p-2 border rounded"
>
    <option value="">Select a Teacher</option>
    {teachers.map((teacher) => (
        <option key={teacher._id} value={teacher._id}>
            {teacher.name}
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