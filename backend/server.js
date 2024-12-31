// /Users/jonatas/Documents/Projects/ai-publisher/backend/server.js
// Entry point of the Express backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection configuration
const mongoose = require('mongoose');

// Define MongoDB connection URL based on environment
// When running in Docker, we use the service name 'mongo' as the host
// The format is: mongodb://[service-name]:[port]/[database-name]
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add retry configuration
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initialize MongoDB connection
connectWithRetry();

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});