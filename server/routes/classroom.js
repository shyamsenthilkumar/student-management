const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Classroom = require('../models/Classroom');

// Get all classrooms
router.get('/classrooms', authMiddleware, async (req, res) => {
    try {
        const classrooms = await Classroom.find({})
            .populate('teacher', 'name email')
            .populate('students', 'name email');
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific classroom
router.get('/classrooms/:id', authMiddleware, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email');
            
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create classroom
router.post('/classrooms', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only teachers can create classrooms' });
        }

        const classroom = new Classroom({
            ...req.body,
            teacher: req.user._id
        });
        await classroom.save();
        res.status(201).json(classroom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update classroom
router.put('/classrooms/:id', authMiddleware, async (req, res) => {
    try {
        const classroom = await Classroom.findOne({ 
            _id: req.params.id,
            teacher: req.user._id
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or unauthorized' });
        }

        Object.assign(classroom, req.body);
        await classroom.save();
        res.json(classroom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete classroom
router.delete('/classrooms/:id', authMiddleware, async (req, res) => {
    try {
        const classroom = await Classroom.findOneAndDelete({
            _id: req.params.id,
            teacher: req.user._id
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or unauthorized' });
        }

        res.json({ message: 'Classroom deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;