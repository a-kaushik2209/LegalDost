const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const analysisRoutes = require('./routes/analysis');

const app = express();

// Trust proxy for Railway deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://legaldost-frontend.vercel.app',
      'https://legaldost-frontend-bjwceajad-aryans-projects-f84ec15d.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  trustProxy: process.env.NODE_ENV === 'production'
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);

// Backend-only deployment - no client serving
// Frontend is deployed separately on Vercel

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'LegalDost Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'LegalDost Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents', 
      analysis: '/api/analysis'
    }
  });
});

// Catch-all route for undefined API endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This is a backend API. Frontend is deployed separately.',
    availableEndpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      documents: '/api/documents',
      analysis: '/api/analysis'
    }
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legal-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Make sure MongoDB is running on your system');
    console.log('Installation guide: https://docs.mongodb.com/manual/installation/');
    
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});