const express = require('express');
const router = express.Router();
const cors = require('cors');
const { requireAuth, requireRole, authLimiter } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// Import controller functions explicitly
const {
  register,
  login,
  resetPassword,
  verifyEmail,
  approveUser
} = authController;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
};

// Async wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.post('/register', 
  cors(corsOptions),
  authLimiter,
  asyncHandler(register)
);

router.post('/login',
  cors(corsOptions), 
  authLimiter,
  asyncHandler(login)
);

router.post('/reset-password',
  cors(corsOptions),
  authLimiter, 
  asyncHandler(resetPassword)
);

// Protected routes
router.get('/verify-email/:token',
  cors(corsOptions),
  asyncHandler(verifyEmail)
);

router.post('/approve',
  cors(corsOptions),
  requireAuth,
  requireRole('admin'),
  asyncHandler(approveUser)
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Auth route error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

module.exports = router;