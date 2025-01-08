const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware to restrict excessive requests
 * 
 * - Limits each IP to 100 requests per 15-minute window.
 * - Sends a friendly error message if the limit is exceeded.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum number of requests per IP per window
  message: { error: 'Too many requests, please try again later' },
});

module.exports = { authLimiter };