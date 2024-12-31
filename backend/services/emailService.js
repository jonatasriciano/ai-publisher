// /Users/jonatas/Documents/Projects/ai-publisher/backend/services/emailService.js

const nodemailer = require('nodemailer'); // For sending emails
require('dotenv').config(); // Load environment variables

/**
 * Configure the nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use TLS if available
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.from - Sender's email address
 * @param {string} options.to - Recipient's email address
 * @param {string} options.subject - Subject of the email
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 */
const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail(options);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };