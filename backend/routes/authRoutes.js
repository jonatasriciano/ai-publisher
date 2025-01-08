const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * Routes for user authentication
 */

// Route for user registration
router.post(
  '/register',
  authLimiter,
  [
    body('name').isLength({ min: 2 }).trim(), // Validate name
    body('email').isEmail().normalizeEmail(), // Validate and normalize email
    body('password').isLength({ min: 6 }), // Validate password length
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }
    next();
  },
  authController.register
);

// Route for user login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(), // Validate email
    body('password').exists(), // Check if password exists
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }
    next();
  },
  authController.login
);

// Protected route to get the authenticated user's profile
router.get('/me', requireAuth, authController.me);

module.exports = router;