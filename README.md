# Let's Do Prenup - Enhanced Platform

A comprehensive online platform for creating legally enforceable prenuptial and postnuptial agreements across key U.S. jurisdictions (California, Washington, New York, Washington D.C., and Virginia) with AI-powered analysis and state-specific compliance.

## 🎯 Overview

Let's Do Prenup is a guided, state-specific platform that helps couples create legally compliant prenuptial agreements with confidence. The platform ensures proper legal requirements are met while providing an intuitive user experience for complex legal processes, featuring AI-powered analysis and personalized recommendations.

## 🚀 Key Features

### ✅ Enhanced User Experience
- **5-Step Guided Process**: State selection → Requirements review → Questionnaire → AI Analysis → Notarization options
- **AI-Powered Analysis**: Confidential analysis of prenup complexity with attorney review recommendations
- **State-Specific Compliance**: Automatic enforcement of state-specific legal requirements
- **Modern UI/UX**: Beautiful, responsive design with intuitive navigation

### ✅ Legal Compliance
- **California**: 7-day waiting period, fairness testing, full disclosure
- **Washington**: Community property rules, comprehensive disclosure
- **New York**: Mandatory notarization, fair and reasonable standards
- **Washington D.C.**: UPAA compliance, disclosure requirements
- **Virginia**: Voluntariness emphasis, full disclosure requirements

### ✅ Technical Features
- **React 18 + TypeScript**: Modern frontend with type safety
- **Node.js + Express**: Robust backend API
- **DynamoDB**: Scalable single-table design with V0 versioning
- **AWS Lambda Ready**: Serverless deployment architecture
- **Docker Support**: Containerized development environment

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: DynamoDB with V0 versioning system
- **Authentication**: JWT-based authentication system
- **UI Components**: Headless UI + Heroicons
- **AI Analysis**: Custom AI-powered recommendation engine
- **Deployment**: Docker containerization + AWS Lambda ready

### Project Structure
```
letsdoprenup/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages (HomePage, Wizard, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles and Tailwind config
│   └── dist/               # Production build
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── services/       # DynamoDB business logic services
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript entity definitions
│   │   ├── server.ts       # Express app configuration
│   │   └── lambda.ts       # AWS Lambda handler
│   ├── scripts/            # Database setup scripts
│   └── dist/               # Compiled TypeScript
├── docker-compose.yml       # Multi-service Docker setup with DynamoDB Local
└── package.json            # Workspace configuration
```

## 🚀 Quick Start - Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for DynamoDB Local)
- AWS CLI (for production deployment)

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd letsdoprenup

# Install all dependencies (frontend, backend, and workspace)
npm run install:all
```

### Step 2: Start DynamoDB Local
```bash
# Start DynamoDB Local using Docker
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory

# Verify DynamoDB is running
curl http://localhost:8000/shell
```

### Step 3: Set Up Database Tables
```bash
# Navigate to backend and set up tables
cd backend
npm run setup:tables
```

### Step 4: Start Development Servers
```bash
# Return to root directory
cd ..

# Start both frontend and backend in development mode
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **DynamoDB Local Admin**: http://localhost:8000/shell
- **Health Check**: http://localhost:3001/health

## 🧪 Testing the Application

### 1. Homepage Testing
1. Open http://localhost:3000
2. Verify the enhanced homepage with:
   - "Build Your Prenup With Confidence" messaging
   - 5-step process overview
   - State-specific compliance information
   - AI-powered analysis features

### 2. User Registration and Login
1. Click "Start Your Prenup" or "Sign In"
2. Register a new account with email and password
3. Verify successful login and redirect to dashboard

### 3. Prenup Creation Flow
1. From dashboard, click "Create New Prenup"
2. Enter basic information (title, partner name)
3. Click "Start Wizard" to begin the 5-step process

### 4. 5-Step Wizard Testing
1. **Step 1 - State Selection**: Choose a state (e.g., California)
2. **Step 2 - Requirements**: Review state-specific legal requirements
3. **Step 3 - Questionnaire**: Fill out the comprehensive questionnaire
4. **Step 4 - AI Analysis**: View AI-powered recommendations
5. **Step 5 - Notarization Options**: Choose notarization and attorney review options

### 5. API Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test user registration (replace with actual data)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 6. Database Verification
```bash
# View DynamoDB tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Scan the main table
aws dynamodb scan --table-name letsdoprenup-data --endpoint-url http://localhost:8000
```

## 🗄️ DynamoDB Configuration

### Local Development Setup

#### Environment Variables (backend/.env)
```env
# DynamoDB Configuration
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=letsdoprenup-data
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

# Application Configuration
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Starting DynamoDB Local
```bash
# Option 1: Using Docker directly
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory

# Option 2: Using Docker Compose (includes all services)
docker-compose up dynamodb-local

# Option 3: Using npm script (if available)
npm run dynamodb:local
```

#### Setting Up Tables
```bash
# Create tables with proper GSIs
cd backend
npm run setup:tables

# Verify table creation
curl http://localhost:8000/shell  # Opens DynamoDB Local admin
```

### Single-Table Design

The application uses a single DynamoDB table with the following structure:

```
Table: letsdoprenup-data

Primary Key:
- PK (Partition Key): EntityType#ID (e.g., "USER#123", "PRENUP#456")
- SK (Sort Key): Version (e.g., "V0", "V1", "V2") where V0 = latest

Global Secondary Indexes:
- EntityTypeIndex: entityType (PK), SK (SK) - Query by entity type
- EmailIndex: email (PK) - User lookup by email
- CreatedByIndex: createdBy (PK), SK (SK) - User-owned entities
- PrenupIndex: prenupId (PK), SK (SK) - Prenup-related entities
```

## 🚢 AWS Deployment

### Prerequisites for AWS Deployment
1. AWS CLI configured with appropriate credentials
2. AWS SAM CLI installed (for Lambda deployment)
3. S3 bucket for deployment artifacts
4. DynamoDB table created in AWS

### Step 1: Prepare for Production
```bash
# Build the application for production
npm run build

# Build Lambda-ready package
cd backend
npm run build:lambda
```

### Step 2: Create DynamoDB Table in AWS
```bash
# Create the production table
aws dynamodb create-table \
  --table-name letsdoprenup-prod \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=entityType,AttributeType=S \
    AttributeName=email,AttributeType=S \
    AttributeName=createdBy,AttributeType=S \
    AttributeName=prenupId,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    IndexName=EntityTypeIndex,KeySchema=[{AttributeName=entityType,KeyType=HASH},{AttributeName=SK,KeyType=RANGE}],Projection={ProjectionType=ALL} \
    IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
    IndexName=CreatedByIndex,KeySchema=[{AttributeName=createdBy,KeyType=HASH},{AttributeName=SK,KeyType=RANGE}],Projection={ProjectionType=ALL} \
    IndexName=PrenupIndex,KeySchema=[{AttributeName=prenupId,KeyType=HASH},{AttributeName=SK,KeyType=RANGE}],Projection={ProjectionType=ALL}
```

### Step 3: Deploy Backend to AWS Lambda
```bash
# Package Lambda function
cd backend
npm run package:lambda

# Deploy using AWS CLI
aws lambda create-function \
  --function-name letsdoprenup-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler dist/lambda.handler \
  --zip-file fileb://lambda-deployment.zip \
  --environment Variables='{NODE_ENV=lambda,DYNAMODB_TABLE_NAME=letsdoprenup-prod,AWS_REGION=us-east-1}'

# Or deploy using SAM
sam build
sam deploy --guided
```

### Step 4: Deploy Frontend to S3 + CloudFront
```bash
# Build frontend for production
cd frontend
npm run build

# Sync to S3 bucket
aws s3 sync dist/ s3://your-frontend-bucket --delete

# Create CloudFront distribution (via AWS Console or CLI)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Step 5: Environment Configuration
```env
# Production Environment Variables
NODE_ENV=lambda
DYNAMODB_TABLE_NAME=letsdoprenup-prod
AWS_REGION=us-east-1
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔧 Development Commands

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Development (runs both frontend and backend)
npm run dev

# Build for production
npm run build

# Build for Lambda deployment
npm run build:lambda

# Run tests
npm run test

# Backend specific
cd backend
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm run start:lambda     # Start in Lambda mode
npm run dynamodb:local   # Start DynamoDB Local
npm run setup:tables     # Initialize tables

# Frontend specific  
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### DynamoDB Management

```bash
# Start DynamoDB Local
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory

# Set up tables with GSIs
cd backend && npm run setup:tables

# Access DynamoDB Local admin interface
open http://localhost:8000/shell

# Query data directly
aws dynamodb scan --table-name letsdoprenup-data --endpoint-url http://localhost:8000
```

## 🎯 Enhanced Features

### 5-Step Process Implementation
1. **State Selection**: Interactive state picker with legal requirement previews
2. **Requirements Review**: Detailed breakdown of state-specific legal requirements
3. **Comprehensive Questionnaire**: Multi-faceted assessment of financial and personal situation
4. **AI Analysis**: Intelligent recommendation engine for attorney review needs
5. **Notarization Options**: Flexible notarization and attorney review choices

### AI-Powered Analysis
- **Complexity Assessment**: Analyzes questionnaire responses to determine prenup complexity
- **Attorney Review Recommendations**: Provides personalized guidance on legal counsel needs
- **Confidence Scoring**: Shows confidence level in recommendations
- **State-Specific Considerations**: Factors in state requirements for recommendations

### State-Specific Compliance
- **California**: 7-day waiting period, fairness testing, full disclosure requirements
- **Washington**: Community property rules, comprehensive disclosure requirements
- **New York**: Mandatory notarization, fair and reasonable standards
- **Washington D.C.**: UPAA compliance, disclosure requirements
- **Virginia**: Voluntariness emphasis, full disclosure requirements

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with configurable expiration
- CORS protection
- Rate limiting on API endpoints
- Input validation with Joi
- File upload restrictions and validation
- Access control for all operations
- Version history for audit trails

## 🚢 Deployment Options

### Docker Deployment
```bash
# Build and start all services with DynamoDB Local
docker-compose up --build

# Initialize tables
docker-compose exec backend npm run setup:tables
```

### AWS Lambda Deployment
```bash
# Build for Lambda
npm run build:lambda

# Package for deployment
npm run package:lambda

# Deploy using AWS CLI, SAM, or Serverless Framework
aws lambda update-function-code --function-name letsdoprenup-api --zip-file fileb://lambda-deployment.zip
```

### Environment Setup

#### Development
- Uses DynamoDB Local on port 8000
- File storage in local filesystem
- Basic rate limiting

#### Production  
- Uses AWS DynamoDB
- File storage in S3 (recommended)
- Enhanced rate limiting and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@domain.com]

---

**⚖️ Legal Notice**: This platform provides document preparation services and legal information but does not provide legal advice. We recommend consulting with a qualified attorney for legal guidance specific to your situation.

## 🔄 Version History

### v2.1.0 - Enhanced Platform
- ✅ Enhanced homepage with "Build Your Prenup With Confidence" messaging
- ✅ Implemented comprehensive 5-step wizard process
- ✅ Added AI-powered analysis and recommendations
- ✅ State-specific compliance with detailed requirements
- ✅ Modern, responsive UI with improved UX
- ✅ Notarization and attorney review options
- ✅ Enhanced testing and deployment instructions
- ✅ Complete local development setup guide