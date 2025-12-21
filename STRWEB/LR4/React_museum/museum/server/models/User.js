const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, required: true },
  name: String,
  avatar: String,
  
  googleId: { type: String, unique: true, sparse: true },
  googleData: Object,
  
  passwordHash: String,
  salt: String,
  
  role: { 
    type: String, 
    enum: ['visitor', 'admin', 'curator', 'employee'], 
    default: 'visitor' 
  },
  isActive: { type: Boolean, default: true },

  authMethod: { 
    type: String, 
    enum: ['local', 'google', 'demo'], 
    default: 'local' 
  },
  
  loginCount: { type: Number, default: 0 },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);