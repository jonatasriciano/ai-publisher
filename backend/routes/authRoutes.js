const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Debug
console.log('[AuthRoutes] Initializing authentication routes...');

// Auth routes
router.post('/register',
  authLimiter,
  [
    body('name').isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  (req, res, next) => {
    console.log('[AuthRoutes] Register request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[AuthRoutes] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.register
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  (req, res, next) => {
    console.log('[AuthRoutes] Login request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[AuthRoutes] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);

// Protected routes
router.get('/me', requireAuth, (req, res) => {
  console.log('[AuthRoutes] Fetching user profile for:', req.user);
  authController.me(req, res);
});

module.exports = router;