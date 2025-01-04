// authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to validate JWT token and set user in request
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('No token provided');
    if (!authHeader.startsWith('Bearer ')) throw new Error('Invalid token format');

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      error: error.message || 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

module.exports = { requireAuth };