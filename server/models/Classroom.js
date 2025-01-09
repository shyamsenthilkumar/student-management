const mongoose = require('mongoose');

// Classroom schema definition
const classroomSchema = new mongoose.Schema({
    standard: { type: String, required: true },
    section: { type: String, required: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },  // Teacher is required for each classroom
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],  // List of students
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create a Classroom model from the schema
const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
