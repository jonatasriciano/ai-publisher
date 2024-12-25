// /Users/jonatas/Documents/Projects/ai-publisher/backend/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  approved: { type: Boolean, default: false } // Only approved users can upload
});

module.exports = mongoose.model('User', userSchema);