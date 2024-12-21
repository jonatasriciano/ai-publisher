import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// GET /api/confirm-email?token=XYZ
router.get('/', async (req, res) => {
  try {
    const { token } = req.query;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    // Find user and update emailConfirmed
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ message: 'Email already confirmed.' });
    }

    user.emailConfirmed = true;
    await user.save();

    res.json({ message: 'Email confirmed successfully!' });
  } catch (error) {
    console.error('Email Confirmation Error:', error.message);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

export default router;