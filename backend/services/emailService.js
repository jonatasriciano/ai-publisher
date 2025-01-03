const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configure rate limiter
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Create transporter with retries
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Email templates
const templates = {
  verification: (token) => ({
    subject: 'Verify your email',
    html: `Please click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a> to verify your email`
  }),
  welcome: (name) => ({
    subject: 'Welcome to AI Publisher',
    html: `Welcome ${name}! Your account has been created successfully.`
  }),
  resetPassword: (token) => ({
    subject: 'Reset Password',
    html: `Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a> to reset your password`
  })
};

// Send email with retries
const sendEmail = async (options) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        ...options
      });
      return info;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
};

module.exports = {
  sendEmail,
  emailLimiter,
  templates
};