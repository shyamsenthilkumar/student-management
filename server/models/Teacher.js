// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'teacher',
        enum: ['teacher', 'admin']
    },
    classrooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

teacherSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;