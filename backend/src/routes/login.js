import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// POST /api/login - Validate user login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful!', token });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error.', error: error.message });
  }
});

export default router;