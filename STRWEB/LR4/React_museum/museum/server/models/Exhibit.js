const mongoose = require('mongoose');

const exhibitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exhibit name is required'],
    trim: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: ['art', 'history', 'science', 'archaeology', 'natural']
  },
  location: {
    hall: { type: String, required: true },
    room: String,
    coordinates: {
      x: Number,
      y: Number
    }
  },
  status: {
    type: String,
    enum: ['exhibited', 'storage', 'restoration', 'loaned'],
    default: 'exhibited'
  },
  conservationState: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_attention'],
    default: 'good'
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  image: String,
  aiDescription: String, // Генерируется через GPT
  lastConservationCheck: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

exhibitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Exhibit', exhibitSchema);