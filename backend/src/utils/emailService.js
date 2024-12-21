import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter with Mailtrap credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Mailtrap host
  port: parseInt(process.env.SMTP_PORT), // Mailtrap port
  auth: {
    user: process.env.EMAIL_USER, // Mailtrap username
    pass: process.env.EMAIL_PASS  // Mailtrap password
  },
  tls: {
    rejectUnauthorized: false // Avoid TLS issues
  },
  debug: true, // Enable debugging
  logger: true // Log SMTP interactions
});

// Send confirmation email
export const sendConfirmationEmail = async (email, token) => {
  const confirmationUrl = `http://localhost:3000/confirm-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Confirm Your Email - AI Publisher',
    text: `Please confirm your email by clicking this link: ${confirmationUrl}`,
    html: `<p>Please confirm your email by clicking <a href="${confirmationUrl}">here</a>.</p>`
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw new Error('Unable to send confirmation email.');
  }
};