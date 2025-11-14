// server/models/Course.js
const mongoose = require('mongoose');

module.exports = mongoose.model('Course', new mongoose.Schema({
  name: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  date: String,
  time: String,
  price: { type: Number, required: true, default: 500 }, // M500 default
  registeredStudents: { type: Number, default: 0 }
}));