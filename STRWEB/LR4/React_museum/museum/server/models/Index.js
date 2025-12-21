// server/models/index.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the provided URI (or local default).
 * No deprecated options are needed on Mongoose 7+.
 */
const connectDB = async () => {
  try {
    const uri =  'mongodb://127.0.0.1:27017/museum_db';
  
    console.log('🔗 Connecting to MongoDB...', uri);

    const conn =  await mongoose.connect(uri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Centralised model exports
const Exhibit = require('./Exhibit');
const User = require('./User');
const Employee = require('./Employee');
const Tour = require('./Tour');

module.exports = {
  connectDB,
  Exhibit,
  User,
  Employee,
  Tour
};