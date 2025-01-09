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

    // Teacher route to create parent account
    router.post('/users/create-parent', verifyTeacherToken, async (req, res) => {
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

            const newParent = new User({
                username,
                email,
                password: hashedPassword,
                role: 'parent'
            });

            await newParent.save();
            const token = uuidv4();

            res.status(201).json({
                message: 'Parent account created successfully',
                token,
                user: { 
                    id: newParent._id, 
                    username: newParent.username, 
                    email: newParent.email,
                    role: newParent.role 
                }
            });
        } catch (error) {
            console.error('Error creating parent account:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    router.post('/auth/admin/classrooms', authMiddleware, async (req, res) => {
        const { standard, section, roomNumber, capacity, students } = req.body;
    
        try {
            // Role validation: Only teacher or admin can create a classroom
            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only teachers and admins can create classrooms' });
            }
    
            // Input validation
            if (!standard || !section || !roomNumber || !capacity) {
                return res.status(400).json({ message: 'All fields are required' });
            }
    
            // Check if classroom already exists with the same details
            const classroomExists = await Classroom.findOne({
                standard: standard.trim(),
                section: section.trim().toUpperCase(),
                roomNumber: roomNumber.trim()
            });
    
            if (classroomExists) {
                return res.status(409).json({ message: 'Classroom already exists' });
            }
    
            // Create a new classroom
            const newClassroom = new Classroom({
                standard: standard.trim(),
                section: section.trim().toUpperCase(),
                roomNumber: roomNumber.trim(),
                capacity: parseInt(capacity),
                teacherId: req.user.id, // Use the ID of the authenticated user (teacher/admin)
                students: students || [],  // Assign students if provided
                createdAt: new Date(),
                updatedAt: new Date()
            });
    
            await newClassroom.save();
    
            res.status(201).json({
                message: 'Classroom created successfully',
                classroom: {
                    id: newClassroom._id,
                    standard: newClassroom.standard,
                    section: newClassroom.section,
                    roomNumber: newClassroom.roomNumber,
                    capacity: newClassroom.capacity,
                    teacherId: newClassroom.teacherId,
                    students: newClassroom.students
                }
            });
        } catch (error) {
            console.error('Error during classroom creation:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
    
    
    
    
    
    module.exports = router;