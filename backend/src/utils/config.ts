import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  dynamodb: {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined),
    tableName: process.env.DYNAMODB_TABLE_NAME || 'letsdoprenup-data',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local'
  },
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