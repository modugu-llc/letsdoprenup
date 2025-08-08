import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import prenupRoutes from './routes/prenups';
import documentRoutes from './routes/documents';
import financialRoutes from './routes/financial';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'Express Server'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/prenups', prenupRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/financial', financialRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port || 3001;

// Only start server if not in Lambda environment
if (process.env.NODE_ENV !== 'lambda') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🗄️  Database: DynamoDB (${config.dynamodb.endpoint || 'AWS'})`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;