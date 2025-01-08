const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let classes = []; // Temporary in-memory store for classes

// Existing code (do not modify)
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user' });
  }
};

const createTeacher = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Additional Code (New Features)

// Fetch all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }); // Assuming a `role` field exists in User schema
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
};

// Fetch all classes
const getClasses = (req, res) => {
  res.status(200).json(classes);
};

// Add a new class
const addClass = (req, res) => {
  const { name, teacherId } = req.body;

  const newClass = { id: Date.now().toString(), name, teacherId };
  classes.push(newClass);
  res.status(201).json({ message: 'Class created successfully', class: newClass });
};

// Delete a class
const deleteClass = (req, res) => {
  const { id } = req.params;
  const index = classes.findIndex((cls) => cls.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Class not found' });
  }

  classes.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  registerUser,
  loginUser,
  createTeacher,
  getTeachers,
  getClasses,
  addClass,
  deleteClass,
};
