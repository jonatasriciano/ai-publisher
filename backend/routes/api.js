const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const { authLimiter } = require('../middleware/rateLimitMiddleware');


// Authentication Routes
router.post(
  '/auth/register',
  authLimiter,
  [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.register
);
router.post('/auth/login', authLimiter, authController.login);

// Protected Routes (requires authentication)
router.get('/auth/me', requireAuth, authController.me);
router.post('/posts/upload', requireAuth, postController.uploadPost);
router.get('/posts', requireAuth, postController.getPosts);

module.exports = router;