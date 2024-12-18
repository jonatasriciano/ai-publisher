import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendConfirmationEmail } from '../utils/emailService.js';

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, company } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, company });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await sendConfirmationEmail(email, token);

    res.status(201).json({ message: 'Registration successful. Check your email to confirm.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Confirm Email
export const confirmEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findOneAndUpdate({ email: decoded.email }, { emailConfirmed: true });

    res.status(200).json({ message: 'Email confirmed successfully. Await admin approval.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    if (!user.emailConfirmed) throw new Error('Email not confirmed');
    if (!user.approvedByAdmin) throw new Error('Account not approved by admin');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};