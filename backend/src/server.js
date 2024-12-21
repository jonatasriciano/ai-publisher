import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes and middleware
import authMiddleware from './middleware/authMiddleware.js';
import registerRoute from './routes/register.js';
import loginRoute from './routes/login.js';
import confirmEmailRoute from './routes/confirmEmail.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==================
// MongoDB Connection
// ==================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-publisher';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // Timeout to check server
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// ==================
// Middleware
// ==================

// Comprehensive CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',  // React development server
    'http://localhost:3001',  // Potential backend server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// ==================
// Routes
// ==================
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/confirm-email', confirmEmailRoute);

// Test Route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Protected Route Example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route.', user: req.user });
});

// ==================
// Start the Server
// ==================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});