// /Users/jonatas/Documents/Projects/ai-publisher/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, approveUser } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin route to approve user
router.post('/approve', approveUser);

module.exports = router;