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

module.exports = { requireAuth };const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later' },
});

module.exports = { authLimiter };const validator = require('validator');
const xss = require('xss');

const sanitizeInput = (input) => {
  return xss(validator.trim(input));
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  return validator.isLength(password, { min: 6 }) &&
    /[A-Z]/.test(password) && // Has uppercase
    /[a-z]/.test(password) && // Has lowercase
    /[0-9]/.test(password);   // Has number
};

const validateName = (name) => {
  return validator.isLength(name, { min: 2, max: 50 }) &&
    validator.matches(name, /^[a-zA-Z\s]*$/);
};

exports.validateRegistration = (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);

    // Required fields check
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'All fields are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Email validation
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters and contain uppercase, lowercase, and number',
        code: 'WEAK_PASSWORD'
      });
    }

    // Name validation
    if (!validateName(sanitizedName)) {
      return res.status(400).json({
        error: 'Name must be 2-50 characters and contain only letters',
        code: 'INVALID_NAME'
      });
    }

    // Add sanitized values to request
    req.sanitizedBody = {
      email: sanitizedEmail,
      password,
      name: sanitizedName
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR'
    });
  }
};

exports.validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email);

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Add sanitized values to request
    req.sanitizedBody = {
      email: sanitizedEmail,
      password
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR'
    });
  }
};

exports.validatePostCreation = (req, res, next) => {
  try {
    const { platform, caption } = req.body;

    if (!platform || !caption) {
      return res.status(400).json({
        error: 'Platform and caption are required',
        code: 'MISSING_FIELDS'
      });
    }

    const sanitizedCaption = sanitizeInput(caption);

    if (!validator.isLength(sanitizedCaption, { min: 1, max: 2000 })) {
      return res.status(400).json({
        error: 'Caption must be between 1 and 2000 characters',
        code: 'INVALID_CAPTION'
      });
    }

    if (!['LinkedIn', 'Twitter', 'Facebook'].includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform',
        code: 'INVALID_PLATFORM'
      });
    }

    req.sanitizedBody = {
      platform,
      caption: sanitizedCaption
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR'
    });
  }
};