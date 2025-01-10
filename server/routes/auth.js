    const express = require('express');
    const router = express.Router();
    const jwt = require('jsonwebtoken')
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const Classroom = require('../models/Classroom');
    const { verifyToken, verifyAdmin } = require('../middlewares/auth');
    const Teacher = require('../models/Teacher');
    const authMiddleware = require('../middlewares/auth');
    


    // Middleware to verify admin token
    const verifyAdminToken = async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            // Here you should implement proper token verification
            // For now, we'll assume if there's a token, it's valid
            // In production, you should verify the token and check admin privileges
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };

    // Register route
    router.post('/auth/register', async (req, res) => {
        const { name, email, password, role } = req.body;
    
        try {
            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }
    
            // Check existing user
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Create user with a role of 'admin' (default)
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: 'admin' // Hardcoded role for all registrations
            });
    
            await newUser.save();
    
            // Generate JWT token
            const token = jwt.sign(
                { id: newUser._id, role: newUser.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            res.status(201).json({
                message: 'Registration successful',
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

  // Admin route to create teacher account
// routes/auth.js (or wherever your routes are defined)
router.post('/auth/admin/create-teacher', async (req, res) => {
    const { name, email, password, role } = req.body;  // Now we accept role in request body

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Teacher already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new teacher (with role)
        const newTeacher = new Teacher({
            name,
            email,
            password: hashedPassword,
            role: role || 'teacher',  // Use the role from the request or default to 'teacher'
        });

        await newTeacher.save();

        // Generate JWT token for the new teacher
        const token = jwt.sign(
            { id: newTeacher._id, role: newTeacher.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Teacher created successfully',
            token,
            user: {
                id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                role: newTeacher.role
            }
        });
    } catch (error) {
        console.error('Error during teacher creation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

    
    const verifyTeacherToken = async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            // Here you should implement proper token verification
            // For now, we'll assume if there's a token and user is a teacher, it's valid
            // In production, you should properly verify the token and check teacher role
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
    const validateApiKey = (req, res, next) => {
        const apiKey = req.header('X-API-Key');
        if (!apiKey || apiKey !== process.env.EXPECTED_API_KEY) {
            return res.status(401).json({ message: 'Unauthorized access. Invalid API key.' });
        }
        next();
    };
    
    // Fetch all teachers
    router.get('/auth/admin/get-teachers', async (req, res) => {
        try {
            // Fetch all teachers from the database
            const teachers = await Teacher.find({ role: 'teacher' }); // Corrected to use Teacher model
            res.status(200).json({ teachers });
    
            // Optional: Log the teachers data to check if the correct data is returned
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Server error while fetching teachers.' });
        }
    });
    
    router.post('/users/create-student', verifyTeacherToken, async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newStudent = new User({
                username,
                email,
                password: hashedPassword,
                role: 'student'
            });

            await newStudent.save();
            const token = uuidv4();

            res.status(201).json({
                message: 'Student account created successfully',
                token,
                user: { 
                    id: newStudent._id, 
                    username: newStudent.username, 
                    email: newStudent.email,
                    role: newStudent.role 
                }
            });
        } catch (error) {
            console.error('Error creating student account:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    router.post('/auth/admin/classrooms', authMiddleware, async (req, res) => {
        const { standard, section, roomNumber, capacity, teacherId, students } = req.body;
        
        try {
            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only teachers and admins can create classrooms' });
            }
            
            if (!standard || !section || !roomNumber || !capacity || !teacherId) {
                return res.status(400).json({ message: 'All fields are required' });
            }
            
            // Verify teacher exists
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
    
            // Check if classroom already exists
            const classroomExists = await Classroom.findOne({
                standard: standard.trim(),
                section: section.trim().toUpperCase(),
                roomNumber: roomNumber.trim(),
            });
            
            if (classroomExists) {
                return res.status(409).json({ message: 'Classroom already exists' });
            }
            
            // Create new classroom with teacher reference
            const newClassroom = new Classroom({
                standard: standard.trim(),
                section: section.trim().toUpperCase(),
                roomNumber: roomNumber.trim(),
                capacity: parseInt(capacity),
                teacherId: teacherId,
                students: students || [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            
            await newClassroom.save();
            
            // Update teacher's classrooms array
            await Teacher.findByIdAndUpdate(
                teacherId,
                { $push: { classrooms: newClassroom._id } }
            );
            
            // Send response with populated teacher data
            const populatedClassroom = await Classroom.findById(newClassroom._id)
                .populate('teacherId', 'name email');
                
            res.status(201).json({
                message: 'Classroom created successfully',
                classroom: {
                    id: populatedClassroom._id,
                    standard: populatedClassroom.standard,
                    section: populatedClassroom.section,
                    roomNumber: populatedClassroom.roomNumber,
                    capacity: populatedClassroom.capacity,
                    teacher: populatedClassroom.teacherId,
                    students: populatedClassroom.students,
                },
            });
        } catch (error) {
            console.error('Error during classroom creation:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    router.get('/auth/admin/fetch-classrooms', authMiddleware, async (req, res) => {
        try {
            const classrooms = await Classroom.find()
                .populate('teacherId', 'name email')
                .lean();
            
            const formattedClassrooms = classrooms.map(classroom => ({
                ...classroom,
                teacherName: classroom.teacherId ? classroom.teacherId.name : 'Unassigned'
            }));
            
            res.status(200).json(formattedClassrooms);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
            res.status(500).json({ message: 'Error fetching classrooms' });
        }
    });
    
    router.put('/api/auth/admin/update-classrooms/:id', authMiddleware, async (req, res) => {
        try {
            console.log('Received update request for classroom:', req.params.id);
            console.log('Update data:', req.body);
    
            // Find the classroom by ID
            const classroom = await Classroom.findById(req.params.id);
            if (!classroom) {
                return res.status(404).json({ message: 'Classroom not found' });
            }
    
            // Validate teacherId (if provided) and ensure it exists
            if (req.body.teacherId) {
                const teacherExists = await Teacher.findById(req.body.teacherId);
                if (!teacherExists) {
                    return res.status(400).json({ message: 'Teacher does not exist' });
                }
            }
    
            // Validate if students don't exceed classroom capacity
            if (req.body.students && req.body.students.length > classroom.capacity) {
                return res.status(400).json({ message: 'Cannot exceed classroom capacity' });
            }
    
            // Update classroom data
            Object.assign(classroom, req.body);
            await classroom.save();
    
            console.log('Classroom updated successfully');
            res.json(classroom); // Respond with the updated classroom
        } catch (error) {
            console.error('Error while updating classroom:', error);
            res.status(500).json({ message: 'Error while updating classroom' });
        }
    });
    


    module.exports = router;