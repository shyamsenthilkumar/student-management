const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: String,
  createdBy: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('User', userSchema);