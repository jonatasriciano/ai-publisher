const { registerUser, authenticateUser } = require('../services/authService');
const User = require('../models/userModel'); // Ensure the path is correct

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    // Register the user using the service method
    const user = await registerUser(req.body);
    // Return success response with user ID
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    // Log and handle registration errors
    console.error('[Register Error]', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Login a user
 */
exports.login = async (req, res) => {
  try {
    // Authenticate user and get token and user details
    const { token, user } = await authenticateUser(req.body);
    // Return successful login response with token and user
    res.json({ token, user });
  } catch (error) {
    // Log and handle authentication errors
    console.error('[Login Error]', error.message);
    res.status(401).json({ error: error.message });
  }
};

/**
 * Get current user's details
 */
exports.me = async (req, res) => {
  try {
    // Find the user based on the userId from the JWT payload
    const user = await User.findById(req.user.userId);
    // If the user doesn't exist, return a 404 response
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
    // Return user details in response
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error) {
    // Log and handle errors retrieving user information
    console.error('[Get User Info Error]', error.message);
    res.status(500).json({
      error: 'Failed to get user info',
      code: 'USER_INFO_ERROR',
    });
  }
};

/**
 * Verify email using the verification token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params; // Extract token from URL
    await verifyEmailToken(verificationToken); // Service to handle verification
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[VerifyEmail Error]', error.message);
    res.status(400).json({ error: error.message });
  }
};
