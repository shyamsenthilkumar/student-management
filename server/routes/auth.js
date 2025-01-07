    const express = require('express');
    const router = express.Router();
    const User = require('../models/User');
    const bcrypt = require('bcrypt');
    const { v4: uuidv4 } = require('uuid');

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

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: 'student' // Default role
            });

            await newUser.save();
            const token = uuidv4();

            res.status(201).json({
                message: 'Registration successful',
                token,
                user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
            });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Login route
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

            const token = uuidv4();

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
    router.post('/auth/admin/create-teacher', verifyAdminToken, async (req, res) => {
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

            const newTeacher = new User({
                username,
                email,
                password: hashedPassword,
                role: 'teacher' // Set role as teacher
            });

            await newTeacher.save();
            const token = uuidv4();

            res.status(201).json({
                message: 'Teacher account created successfully',
                token,
                user: { 
                    id: newTeacher._id, 
                    username: newTeacher.username, 
                    email: newTeacher.email,
                    role: newTeacher.role 
                }
            });
        } catch (error) {
            console.error('Error creating teacher account:', error);
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

    // Keep existing routes (register, login, create-teacher)...
    // [Previous routes remain unchanged]

    // Teacher route to create student account
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
    module.exports = router;