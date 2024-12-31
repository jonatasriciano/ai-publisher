// /Users/jonatas/Documents/Projects/ai-publisher/backend/controllers/authController.js

const User = require('../models/userModel'); // Import user model
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating tokens
const { sendEmail } = require('../services/emailService'); // Import email service
require('dotenv').config(); // Load environment variables


/**
 * Register a new user and notify the admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with 'approved' set to false
    const newUser = new User({
      email,
      password: hashedPassword,
      approved: false,
    });

    // Save the new user
    await newUser.save();

    // Admin notification
    const adminEmail = process.env.ADMIN_EMAIL; // Admin email address
    const emailContent = {
      from: '"AI Publisher" <no-reply@ai-publisher.com>', // Sender address
      to: adminEmail, // Admin email address
      subject: 'New User Registration - Approval Required', // Subject line
      text: `A new user has registered with the email: ${email}. Please log in to the admin panel to approve.`,
      html: `<p>A new user has registered with the email: <strong>${email}</strong>.</p>
             <p>Please log in to the admin panel to approve the user.</p>`,
    };

    try {
      await sendEmail(emailContent); // Use email service
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return res.status(500).json({ error: 'User registered, but email notification failed.' });
    }

    // Redirect to login page with a message
    return res.status(201).json({
      message: 'User registered successfully. Awaiting admin approval.',
      redirectTo: '/login', // Specify the login page path
    });
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, approved: user.approved },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      approved: user.approved,
    });
  } catch (err) {
    console.error('Error during user login:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Approve a user (Admin-only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user's approved status
    user.approved = true;
    await user.save();

    return res.json({ message: `User ${user.email} approved` });
  } catch (err) {
    console.error('Error during user approval:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};