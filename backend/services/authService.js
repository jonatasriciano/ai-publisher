const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, templates } = require('./emailService');

/**
 * Register a new user
 *
 * @param {Object} userData - Object containing name, email, and password
 * @returns {Object} - The newly created user
 * @throws {Error} - If the email is already registered
 */
const registerUser = async ({ name, email, password }) => {
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Prepare email options
    const options = {
      to: email,
      ...templates.welcome({ verificationToken }),
    };

    // Send email
    try {
      console.log('[RegisterUser] Sending welcome email to:', email);
      await sendEmail(options);
    } catch (emailError) {
      console.error('[RegisterUser] Failed to send welcome email:', emailError.message);
      throw new Error('Failed to send welcome email, please try again.');
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000, // Token valid for 24 hours
    });

    return user;
  } catch (error) {
    console.error('[RegisterUser] Error:', error.message); // Log the error message
    throw error;
  }
};

/**
 * Authenticate user and generate JWT
 *
 * @param {Object} credentials - Object containing email and password
 * @returns {Object} - Object containing user and token
 * @throws {Error} - If authentication fails or email is not verified
 */
const authenticateUser = async ({ email, password }) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // Ensure the user's email is verified
    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token valid for 24 hours
    );

    return { user, token };
  } catch (error) {
    console.error('[AuthenticateUser] Error:', error.message); // Log the error message
    throw error;
  }
};

/**
 * Verify email using the verification token
 *
 * @param {string} verificationToken - The token to verify
 * @throws {Error} - If the token is invalid or expired
 */
const verifyEmailToken = async (verificationToken) => {
  try {
    const user = await User.findOne({
      verificationToken,
      verificationExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.verificationToken = undefined; // Clear the token
    user.verificationExpires = undefined; // Clear expiration
    await user.save();
  } catch (error) {
    console.error('[VerifyEmailToken Error]', error.message);
    throw new Error('Failed to verify email');
  }
};

module.exports = { registerUser, authenticateUser, verifyEmailToken };
