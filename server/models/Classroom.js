const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    standard: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    roomNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    teacherId: {  // Changed from teacher string to teacherId reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    currentStudentCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Classroom = mongoose.model('Classroom', classroomSchema);
module.exports = Classroom;
