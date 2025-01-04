const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Debug: Startup logs
console.log('[Server] Starting...');
console.log('[Server] Environment:', process.env.NODE_ENV || 'development');

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  console.log('[Headers]', req.headers);
  console.log('[Query]', req.query);
  res.on('finish', () => {
    console.log('[Response Headers]', res.getHeaders());
  });
  next();
});

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || !origin) {
      console.log(`[CORS] Allowed Origin: ${origin || 'Direct Request'}`);
      callback(null, true);
    } else {
      console.error(`[CORS] Blocked Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests
app.options('*', cors(corsOptions), (req, res) => {
  console.log('[CORS] Preflight request handled.');
  res.sendStatus(200);
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP temporarily
  })
);

// JSON and URL-encoded parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB connection setup
const connectDB = async () => {
  try {
    console.log('[MongoDB] Connecting...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Connection established.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Disconnected.');
    });
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  console.error(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR',
  });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
  console.log(`[CORS] Allowed Origin: ${process.env.FRONTEND_URL}`);
});