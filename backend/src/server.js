// /Users/jonatas/Documents/Projects/ai-publisher/backend/src/server.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import registerRoute from './routes/register.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==================
// Middleware
// ==================
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================
// Routes
// ==================
app.use('/api/register', registerRoute);

// Test Route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// ==================
// Start the Server
// ==================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});