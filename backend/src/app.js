import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js'; // Import default export

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve('public')));

// Routes
app.use('/auth', authRoutes); // Register the auth routes

export default app;