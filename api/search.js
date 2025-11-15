const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import the built backend application
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const searchRouter = require('./backend/dist/routes/search.js');
const candidatesRouter = require('./backend/dist/routes/candidates.js');

// API routes
app.use('/api/search', searchRouter);
app.use('/api/candidates', candidatesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'peoplegpt-backend', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless function
module.exports = app;