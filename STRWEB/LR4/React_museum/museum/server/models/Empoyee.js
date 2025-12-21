const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  position: {
    type: String,
    required: true,
    enum: ['curator', 'conservator', 'guide', 'security', 'administrator']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  department: {
    type: String,
    required: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedExhibits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibit'
  }]
});

module.exports = mongoose.model('Employee', employeeSchema);