const validator = require('validator');
const xss = require('xss');

/**
 * Utility function to sanitize input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  return xss(validator.trim(input));
};

/**
 * Utility function to validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid, otherwise false
 */
const validateEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Utility function to validate password strength
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets strength criteria, otherwise false
 */
const validatePassword = (password) => {
  return (
    validator.isLength(password, { min: 6 }) &&
    /[A-Z]/.test(password) && // Contains uppercase letter
    /[a-z]/.test(password) && // Contains lowercase letter
    /[0-9]/.test(password)    // Contains a number
  );
};

/**
 * Utility function to validate name format
 * @param {string} name - The name to validate
 * @returns {boolean} True if name is valid, otherwise false
 */
const validateName = (name) => {
  return (
    validator.isLength(name, { min: 2, max: 50 }) &&
    validator.matches(name, /^[a-zA-Z\s]*$/) // Only letters and spaces
  );
};

/**
 * Middleware to validate registration data
 */
const validateRegistration = (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'All fields are required',
        code: 'MISSING_FIELDS',
      });
    }

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters and contain uppercase, lowercase, and a number',
        code: 'WEAK_PASSWORD',
      });
    }

    if (!validateName(sanitizedName)) {
      return res.status(400).json({
        error: 'Name must be 2-50 characters and contain only letters',
        code: 'INVALID_NAME',
      });
    }

    req.sanitizedBody = {
      email: sanitizedEmail,
      password,
      name: sanitizedName,
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware to validate login data
 */
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS',
      });
    }

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      });
    }

    req.sanitizedBody = {
      email: sanitizedEmail,
      password,
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware to validate post creation data
 */
const validatePostCreation = (req, res, next) => {
  try {
    const { platform, caption } = req.body;

    if (!platform || !caption) {
      return res.status(400).json({
        error: 'Platform and caption are required',
        code: 'MISSING_FIELDS',
      });
    }

    const sanitizedCaption = sanitizeInput(caption);

    if (!validator.isLength(sanitizedCaption, { min: 1, max: 2000 })) {
      return res.status(400).json({
        error: 'Caption must be between 1 and 2000 characters',
        code: 'INVALID_CAPTION',
      });
    }

    if (!['LinkedIn', 'Twitter', 'Facebook'].includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform',
        code: 'INVALID_PLATFORM',
      });
    }

    req.sanitizedBody = {
      platform,
      caption: sanitizedCaption,
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
    });
  }
};

module.exports = { validateRegistration, validateLogin, validatePostCreation };