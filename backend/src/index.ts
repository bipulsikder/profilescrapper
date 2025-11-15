import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables BEFORE importing config
const envPaths = [
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env'),
  '.env.local',
  '.env'
];

dotenv.config({ path: envPaths });

// Now import config after environment is loaded
import { config } from './config';
import { searchRouter } from './routes/search';
import { candidatesRouter } from './routes/candidates';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', service: 'peoplegpt-backend', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/search', searchRouter);
app.use('/api/candidates', candidatesRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 PeopleGPT Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Config valid: ${config.validate() ? '✅' : '❌'}`);
});