const mongoose = require('mongoose');

module.exports = mongoose.model('Registration', new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  feeSlip: String,
  confirmed: { type: Boolean, default: false }
}));