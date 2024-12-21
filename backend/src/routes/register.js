import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/register - Register new user and send confirmation email
router.post('/', async (req, res) => {
  try {
    const { username, password, companyName, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      companyName,
      email,
      emailConfirmed: false,
      isApproved: false
    });

    await newUser.save();

    // Generate a confirmation token
    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send confirmation email
    await sendConfirmationEmail(newUser.email, token);

    res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;