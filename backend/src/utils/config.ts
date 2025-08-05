import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  docusignConfig: {
    clientId: process.env.DOCUSIGN_CLIENT_ID || '',
    clientSecret: process.env.DOCUSIGN_CLIENT_SECRET || '',
    redirectUri: process.env.DOCUSIGN_REDIRECT_URI || '',
    environment: process.env.DOCUSIGN_ENVIRONMENT || 'demo'
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || ''
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};