// Import required modules
import express from 'express';
import bcrypt from 'bcryptjs'; // For password hashing
import User from '../models/User.js'; // User model
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// =============================
// Route: Register a New User
// =============================
router.post('/register', async (req, res) => {
  try {
    const { username, password, companyName, email } = req.body;

    // Validate required fields
    if (!username || !password || !companyName || !email) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
      companyName,
      email,
      isApproved: false
    });

    await newUser.save();

    return res.status(201).json({
      message: 'User registered successfully. Awaiting approval.'
    });
  } catch (error) {
    console.error('❌ Error in /register route:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Export the router
export default router;