const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  studentId: String,
  password: String,
  role: { type: String, default: 'student' },
  avatar: String
});

module.exports = mongoose.model('User', userSchema);