const { registerUser, authenticateUser } = require('../services/authService');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Login a user
 */
exports.login = async (req, res) => {
  try {
    const { token, user } = await authenticateUser(req.body);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};