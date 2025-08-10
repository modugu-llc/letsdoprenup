import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './utils/config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth';
import prenupRoutes from './routes/prenups';
import documentRoutes from './routes/documents';
import financialRoutes from './routes/financial';

// Create Express app for Lambda
const createExpressApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Rate limiting for Lambda (more restrictive)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
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
      platform: 'AWS Lambda'
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

  return app;
};

// Create the Express app
const app = createExpressApp();

// Create serverless express server
const server = createServer(app);

// Lambda handler
export const handler = (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  return proxy(server, event, context, 'PROMISE').promise;
};

// Export app for local development
export default app;