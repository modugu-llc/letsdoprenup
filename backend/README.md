# Let's Do Prenup - Backend API

This is the backend API for the Let's Do Prenup platform, built with Express.js and TypeScript. It supports both local development and AWS Lambda deployment using the Serverless Framework.

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Docker (for local DynamoDB)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Build the TypeScript code:
```bash
npm run build
```

## Development

### Option 1: Traditional Express Server (Recommended for development)

1. Start DynamoDB locally using Docker:
```bash
# From the root directory
docker-compose up dynamodb-local
```

2. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

### Option 2: Serverless Offline (Lambda simulation)

This option simulates the AWS Lambda environment locally using the Serverless Framework.

1. Start DynamoDB locally using Docker:
```bash
# From the root directory  
docker-compose up dynamodb-local
```

2. Start the serverless offline environment:
```bash
npx serverless offline
```

The API will be available at `http://localhost:3001`, matching the Express server port for consistency.

**Benefits of Serverless Offline:**
- Tests your Lambda handler configuration
- Simulates API Gateway routing
- Matches production AWS Lambda environment more closely
- Useful for testing serverless-specific features

### Full Docker Development

To run the complete stack (backend, frontend, and DynamoDB):

```bash
# From the root directory
docker-compose up
```

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /health` - Health check endpoint
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/prenups` - List prenups
- `POST /api/prenups` - Create prenup
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/financial` - Financial information endpoints

## Environment Variables

Key environment variables for local development:

```bash
NODE_ENV=development
PORT=3001
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=letsdoprenup-data
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npx serverless offline` - Start serverless offline environment
- `npx serverless deploy` - Deploy to AWS (requires AWS credentials)

## Deployment

### AWS Lambda Deployment

1. Configure AWS credentials:
```bash
aws configure
```

2. Deploy using Serverless Framework:
```bash
npx serverless deploy --stage prod
```

### Docker Deployment

Build and run the Docker container:

```bash
docker build -t letsdoprenup-backend .
docker run -p 3001:3001 letsdoprenup-backend
```

## Project Structure

```
backend/
├── src/
│   ├── lambda.ts          # AWS Lambda handler
│   ├── server.ts          # Express server for local development
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── dist/                 # Compiled JavaScript (generated)
├── serverless.yml        # Serverless Framework configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Technology Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Amazon DynamoDB
- **Authentication**: JWT
- **Deployment**: AWS Lambda + Serverless Framework
- **Local Development**: Docker Compose