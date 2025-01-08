const mongoose = require('mongoose');
const classroomSchema = new mongoose.Schema({
  standard: {
      type: String,
      required: true
  },
  section: {
      type: String,
      required: true
  },
  roomNumber: {
      type: String,
      required: true
  },
  capacity: {
      type: Number,
      required: true
  },
  teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
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
