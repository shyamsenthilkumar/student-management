import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        email: '',
        role: 'teacher',
    });
    const [teachers, setTeachers] = useState([]);

    // Fetch teachers when the component mounts
    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('apiKey');
            const response = await axios.get('http://localhost:5000/api/auth/admin/get-teachers', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setTeachers(response.data.teachers); // Update the teachers list
        } catch (error) {
            console.error('Error fetching teachers:', error);
            alert(error.response?.data?.message || 'Failed to fetch teachers');
        }
    };

    useEffect(() => {
        fetchTeachers(); // Fetch teachers when the component mounts
    }, []);

    const createTeacher = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('apiKey');
            await axios.post(
                'http://localhost:5000/api/auth/admin/create-teacher',
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert('Teacher created successfully');
            setFormData({ name: '', password: '', email: '' }); // Reset form fields
            fetchTeachers(); // Re-fetch teachers after creation
        } catch (error) {
            console.error('Error creating teacher:', error);
            alert(error.response?.data?.message || 'Failed to create teacher');
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
                        placeholder="Name"
                        value={formData.name}
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                    />
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create Teacher
                    </button>
                </form>
            </div>

            {/* Teachers List */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl mb-4">Teachers List</h3>
                {teachers.length > 0 ? (
                    <ul>
                        {teachers.map((teacher) => (
                            <li key={teacher._id}>
                                {teacher.name} - {teacher.email}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No teachers found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
