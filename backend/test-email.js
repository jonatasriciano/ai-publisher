const nodemailer = require('nodemailer');
require('dotenv').config(); // Certifique-se de carregar o .env

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS, 
    },
});

const mailOptions = {
    from: `"AI Publisher" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'Test Email',
    text: 'This is a test email to confirm your SMTP configuration is working!',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error('Error sending email:', error);
    }
    console.log('Email sent successfully:', info.response);
});