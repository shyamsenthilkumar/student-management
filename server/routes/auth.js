const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Import UUID


// Register route
router.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save the user
        await newUser.save();

        // Generate UUID token
        const token = uuidv4();

        // You might want to save this token in a session or in a database for future use

        // Return response with token
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate UUID token
        const token = uuidv4();

        // Optional: Store the token in-memory, database, or a cache for session management
        // Example:
        // await TokenModel.create({ userId: user._id, token });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
//teacher
router.post('/api/users/create-teacher', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate inputs
  if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
          username,
          email,
          password: hashedPassword,
      });

      // Save the user
      await newUser.save();

      // Generate UUID token
      const token = uuidv4();

      // You might want to save this token in a session or in a database for future use

      // Return response with token
      res.status(201).json({
          message: 'Registration successful',
          token,
          user: { id: newUser._id, username: newUser.username, email: newUser.email },
      });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
