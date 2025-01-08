    const express = require('express');
    const router = express.Router();
    const jwt = require('jsonwebtoken')
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const Classroom = require('../models/Classroom');
    const { verifyToken, verifyAdmin } = require('../middlewares/auth');
    const Teacher = require('../models/Teacher');
    

   router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        console.log(name)
        console.log(email)
        console.log(password)
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

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'student'
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
// Admin route to create teacher account
router.post('/auth/admin/create-teacher', async (req, res) => {
    const { name, email, password } = req.body;

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

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'teacher' // Set the role to 'teacher'
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

// Admin route to get all teachers
router.get('/auth/admin/get-teachers', async (req, res) => {
    try {
        // Fetch all teachers from the database
        const teachers = await User.find({ role: 'teacher' }); // Filter by role: 'teacher'
        res.status(200).json({ teachers });

        // Optional: Log the teachers data to check if the correct data is returned
        console.log(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error while fetching teachers.' });
    }
});

    module.exports = router;