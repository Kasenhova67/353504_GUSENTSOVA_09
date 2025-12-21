const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Tour description is required']
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  schedule: [{
    type: String,
    required: true
  }],
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

tourSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Tour', tourSchema);