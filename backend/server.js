const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Debug: Startup logs
console.log('[Server] Starting...');
console.log('[Server] Environment:', process.env.NODE_ENV || 'development');

// Middleware para logging detalhado
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  console.log('[Headers]', req.headers);
  console.log('[Query]', req.query);
  res.on('finish', () => {
    console.log('[Response Status]', res.statusCode);
    console.log('[Response Headers]', res.getHeaders());
  });
  next();
});

// Configuração de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', (req, res) => {
    console.log('[CORS] Preflight headers:', req.headers);
    res.sendStatus(200);
});

// Segurança com Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Middleware de upload
app.use(fileUpload({
  debug: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Parsers de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexão ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[MongoDB] Connected successfully');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};
connectDB();

// Rotas
app.use('/api', apiRoutes);

// Middleware para arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});