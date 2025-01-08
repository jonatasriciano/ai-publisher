const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configure rate limiter for email API
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many email requests, please try again later' },
});

// Create Nodemailer transporter with retries and connection pooling
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // Use TLS if specified in the environment
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true, // Use connection pooling
  maxConnections: 5, // Maximum simultaneous connections
  maxMessages: 100, // Maximum messages per connection
});

// Email templates for different scenarios
const templates = {
  verification: (token) => ({
    subject: 'Verify your email',
    html: `Please click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a> to verify your email`,
  }),
  welcome: (name) => ({
    subject: 'Welcome to AI Publisher',
    html: `Welcome ${name}! Your account has been created successfully.`,
  }),
  resetPassword: (token) => ({
    subject: 'Reset Password',
    html: `Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a> to reset your password`,
  }),
};

/**
 * Send an email with retry logic
 *
 * @param {Object} options - Email options (to, subject, html, etc.)
 * @returns {Object} - Information about the sent email
 * @throws {Error} - If email sending fails after all retries
 */
const sendEmail = async (options) => {
  const maxRetries = 3; // Maximum number of retry attempts
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Send email using Nodemailer
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, // Sender email address
        ...options, // Merge additional email options
      });
      return info; // Return email sending result on success
    } catch (error) {
      lastError = error; // Store the last error
      console.error(`[SendEmail] Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Throw an error if all retries fail
  console.error('[SendEmail] All attempts to send email failed:', lastError.message);
  throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
};

module.exports = {
  sendEmail,
  emailLimiter,
  templates,
};