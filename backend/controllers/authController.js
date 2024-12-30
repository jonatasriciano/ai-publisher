// /Users/jonatas/Documents/Projects/ai-publisher/backend/controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      email,
      password: hashedPassword,
      approved: false
    });
    await newUser.save();
    
    return res.json({ message: 'User registered, waiting for admin approval' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, approved: user.approved }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '1h' }
    );
    
    return res.json({
      message: 'Login successful',
      token,
      approved: user.approved
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin-only: Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.approved = true;
    await user.save();
    return res.json({ message: `User ${user.email} approved` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};