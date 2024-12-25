// /Users/jonatas/Documents/Projects/ai-publisher/backend/server.js
// Entry point of the Express backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// (Optional) connect to MongoDB (comment out if not using a database)
const mongoose = require('mongoose');
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost/ai_publisher_mvp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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