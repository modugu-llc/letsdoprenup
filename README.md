# Let's Do Prenup - DynamoDB Migration

A comprehensive online platform for creating legally enforceable prenuptial and postnuptial agreements across key U.S. jurisdictions (California, Washington, New York, Washington D.C., and Virginia).

## 🎯 Overview

Let's Do Prenup is a guided, state-specific platform that helps couples create legally compliant prenuptial agreements. The platform ensures proper legal requirements are met while providing an intuitive user experience for complex legal processes.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: DynamoDB with V0 versioning system
- **Authentication**: JWT-based authentication system
- **UI Components**: Headless UI + Heroicons
- **Document Generation**: PDF generation with legal templates (planned)
- **E-Signatures**: DocuSign API integration (planned)
- **Deployment**: Docker containerization + AWS Lambda ready

### Project Structure
```
letsdoprenup/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (recommended for DynamoDB Local)
- AWS CLI (for production deployment)

### Using Docker with DynamoDB Local (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd letsdoprenup

# Start all services (includes DynamoDB Local)
docker-compose up

# Initialize DynamoDB tables (in separate terminal)
cd backend
npm run setup:tables

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - DynamoDB Local Admin: http://localhost:8000/shell
```

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start DynamoDB Local
npm run dynamodb:local

# In separate terminal, set up tables
cd backend
npm run setup:tables

# Start development servers
npm run dev  # Starts both frontend and backend
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
# Option 1: Using npm script
npm run dynamodb:local

# Option 2: Using Docker directly
docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory

# Option 3: Using Docker Compose (includes all services)
docker-compose up dynamodb-local
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

### Data Examples
```json
// User entity
{
  "PK": "USER#1704123456789-abc123",
  "SK": "V0",
  "id": "1704123456789-abc123",
  "entityType": "USER",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "version": "V0"
}

// Prenup entity
{
  "PK": "PRENUP#1704123456790-def456",
  "SK": "V0", 
  "id": "1704123456790-def456",
  "entityType": "PRENUP",
  "title": "Our Prenup Agreement",
  "state": "CALIFORNIA",
  "status": "DRAFT",
  "createdBy": "1704123456789-abc123",
  "createdByEmail": "user@example.com",
  "progress": { "currentStep": 1, "completedSteps": [] },
  "content": {},
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "version": "V0"
}
```

## 📊 Database Operations

### Basic CRUD Examples

#### Create User
```javascript
import { userService } from './services/userService';

const user = await userService.createUser({
  email: 'user@example.com',
  password: 'securepassword',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### Get User with Versioning
```javascript
// Get latest version (V0)
const user = await userService.getUserById('user-id');

// Get specific version
const oldUser = await dynamodbService.getById('USER', 'user-id', 'V1');
```

#### Update with Versioning
```javascript
// Creates new version and updates V0
const updatedUser = await userService.updateUser('user-id', {
  firstName: 'Jane'
});
```

#### Query Operations
```javascript
// Get all prenups for a user
const prenups = await prenupService.getPrenupsByUser('user-id');

// Get financial summary
const summary = await financialService.getFinancialSummary('prenup-id');
```

## 🎯 Core Features

### ✅ Implemented Features

#### User Management & Authentication
- Secure user registration and login with DynamoDB
- JWT-based authentication
- Password hashing with bcrypt
- V0 versioning system for user data changes
- Protected routes and API endpoints

#### State-Specific Legal Compliance
- **California**: 7-day waiting period, fairness testing, full disclosure
- **Washington**: Community property rules, comprehensive disclosure
- **New York**: Mandatory notarization, fair and reasonable standards
- **Washington D.C.**: UPAA compliance, disclosure requirements
- **Virginia**: Voluntariness emphasis, full disclosure requirements

#### Prenup Management
- Create and manage multiple prenup agreements with versioning
- State selection with specific legal requirements
- Progress tracking with step-by-step completion
- Partner collaboration workflow
- Document status management
- Version history tracking

#### Financial Disclosure System
- Comprehensive asset entry forms (real estate, vehicles, investments, etc.)
- Debt tracking (mortgages, student loans, credit cards, etc.)
- Income documentation with multiple sources
- Automatic net worth calculations
- Side-by-side financial comparisons
- Timestamped, auditable disclosure reports
- Version history for audit trails

#### Document Management
- File upload support for financial documents
- Document categorization and organization
- Download capabilities for all documents
- Secure document storage with validation
- File type and size restrictions
- Document version tracking

#### User Interface
- Responsive design for mobile and desktop
- Modern, accessible UI with Tailwind CSS
- Progress indicators and step-by-step guidance
- Legal disclaimers and compliance messaging
- State-specific information and requirements

### 📋 Planned Features

#### Multi-Step Wizard Interface
- Guided interview process with state-specific questions
- Dynamic form validation based on state requirements
- Real-time progress saving
- Step navigation with completion tracking

#### Document Generation
- PDF generation with legal templates
- State-specific document formatting
- Custom clause selection and modification
- Document preview and review system

#### E-Signature Integration
- DocuSign API integration for electronic signatures
- Remote online notarization support
- Identity verification workflows
- Compliance logging and audit trails

## ⚡ AWS Lambda Deployment

The application is ready for serverless deployment to AWS Lambda.

### Lambda Handler
```javascript
// backend/src/lambda.ts exports the main handler
export const handler = (event, context) => {
  return proxy(server, event, context, 'PROMISE').promise;
};
```

### Build for Lambda
```bash
cd backend

# Build Lambda-ready package
npm run build:lambda

# Create deployment zip
npm run package:lambda
```

### Environment Variables for Production
```env
NODE_ENV=lambda
DYNAMODB_TABLE_NAME=letsdoprenup-prod
AWS_REGION=us-east-1
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### DynamoDB Production Setup
```bash
# Create production table
aws dynamodb create-table --cli-input-json file://table-config.json

# Set up GSIs
aws dynamodb update-table --table-name letsdoprenup-prod --cli-input-json file://gsi-config.json
```

## 🔧 Development

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
npm run dynamodb:local

# Set up tables with GSIs
npm run setup:tables

# Access DynamoDB Local admin interface
open http://localhost:8000/shell

# Query data directly
aws dynamodb scan --table-name letsdoprenup-data --endpoint-url http://localhost:8000
```

## 🗄️ Migration from PostgreSQL/Prisma

### Key Changes Made

1. **Database Layer**: Complete replacement of Prisma/PostgreSQL with DynamoDB
2. **Versioning System**: Implemented V0 versioning for all entities
3. **Single Table Design**: All data stored in one table with composite keys
4. **Service Layer**: Created comprehensive service classes for each entity type
5. **Lambda Ready**: All handlers are stateless and Lambda-compatible

### Data Migration Strategy

#### User Versioning
- Latest data always stored with `SK = "V0"`
- Historical versions stored as `V1`, `V2`, etc.
- Automatic version creation on updates

#### Denormalization
- Strategic denormalization for performance (emails in prenups, names in references)
- Reduced need for complex joins
- Improved query performance

#### Access Patterns
- Optimized for application query patterns
- GSIs for efficient lookups by email, entity type, relationships
- Batch operations for related data

### Migration Notes

#### Before Migration (Prisma)
```javascript
const user = await prisma.user.findUnique({
  where: { email },
  include: { createdPrenups: true }
});
```

#### After Migration (DynamoDB)
```javascript
const user = await userService.getUserByEmail(email);
const prenups = await prenupService.getPrenupsByUser(user.id);
```

## 🛡️ Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with configurable expiration
- CORS protection
- Rate limiting on API endpoints
- Input validation with Joi
- File upload restrictions and validation
- Access control for all operations
- Version history for audit trails

## 🚢 Deployment

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

### v2.0.0 - DynamoDB Migration
- ✅ Complete migration from PostgreSQL/Prisma to DynamoDB
- ✅ Implemented V0 versioning system
- ✅ Lambda-ready architecture
- ✅ Single-table design with optimized access patterns
- ✅ Enhanced security and validation
- ✅ Docker setup with DynamoDB Local
- ✅ Comprehensive service layer architecture