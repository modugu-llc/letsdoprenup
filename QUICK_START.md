# Let's Do Prenup - Quick Start Guide

## 🚀 Enhanced Platform Features

This enhanced version of Let's Do Prenup includes:

- **"Build Your Prenup With Confidence"** messaging
- **5-Step Guided Process**: State selection → Requirements → Questionnaire → AI Analysis → Notarization
- **AI-Powered Analysis**: Confidential complexity assessment with attorney review recommendations
- **State-Specific Compliance**: Detailed legal requirements for 5 states
- **Modern UI/UX**: Beautiful, responsive design with intuitive navigation

## ⚡ Quick Start (3 minutes)

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./setup.sh
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm run install:all

# 2. Start DynamoDB Local
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory

# 3. Set up database tables
cd backend && npm run setup:tables && cd ..

# 4. Start development servers
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **DynamoDB Local Admin**: http://localhost:8000/shell
- **Health Check**: http://localhost:3001/health

## 🧪 Testing the Enhanced Features

### 1. Homepage
- Open http://localhost:3000
- Verify "Build Your Prenup With Confidence" messaging
- Check the 5-step process overview
- Review state-specific compliance information

### 2. User Registration
- Click "Start Your Prenup"
- Register with email and password
- Verify successful login

### 3. 5-Step Wizard Process
1. **State Selection**: Choose a state (e.g., California)
2. **Requirements Review**: See state-specific legal requirements
3. **Questionnaire**: Complete comprehensive assessment
4. **AI Analysis**: View AI-powered recommendations
5. **Notarization Options**: Choose notarization and attorney review

### 4. API Testing
```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

## 🗄️ Database Verification

```bash
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Scan data
aws dynamodb scan --table-name letsdoprenup-data --endpoint-url http://localhost:8000
```

## 🚢 AWS Deployment

### Prerequisites
- AWS CLI configured
- AWS SAM CLI installed
- S3 bucket for deployment

### Deployment Steps
```bash
# 1. Build for production
npm run build

# 2. Create DynamoDB table in AWS
aws dynamodb create-table --table-name letsdoprenup-prod --cli-input-json table-config.json

# 3. Deploy backend to Lambda
cd backend
npm run package:lambda
aws lambda create-function --function-name letsdoprenup-api --zip-file fileb://lambda-deployment.zip

# 4. Deploy frontend to S3
cd frontend
npm run build
aws s3 sync dist/ s3://your-frontend-bucket --delete
```

## 🔧 Development Commands

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:frontend          # Start frontend only
npm run dev:backend           # Start backend only

# Building
npm run build                 # Build both frontend and backend
npm run build:frontend        # Build frontend only
npm run build:backend         # Build backend only

# Database
cd backend && npm run setup:tables    # Set up DynamoDB tables
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory
```

## 📋 Key Features Implemented

### ✅ Enhanced User Experience
- Modern, responsive design
- Intuitive 5-step wizard process
- State-specific legal guidance
- AI-powered recommendations

### ✅ Legal Compliance
- **California**: 7-day waiting period, fairness testing
- **Washington**: Community property rules
- **New York**: Mandatory notarization
- **Washington D.C.**: UPAA compliance
- **Virginia**: Voluntariness emphasis

### ✅ Technical Features
- React 18 + TypeScript frontend
- Node.js + Express backend
- DynamoDB with V0 versioning
- JWT authentication
- Docker support
- AWS Lambda ready

## 🛠️ Troubleshooting

### Common Issues

1. **Port 3001 already in use**
   ```bash
   # Kill existing process
   lsof -ti:3001 | xargs kill -9
   ```

2. **DynamoDB Local not responding**
   ```bash
   # Restart container
   docker restart dynamodb-local
   ```

3. **Build errors**
   ```bash
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   npm run install:all
   ```

### Environment Variables
Create `backend/.env`:
```env
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=letsdoprenup-data
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📚 Additional Resources

- **Full Documentation**: See README.md
- **API Documentation**: Check backend/src/routes/
- **Database Schema**: See backend/scripts/setupTables.ts
- **Deployment Guide**: See README.md#aws-deployment

## 🎯 Next Steps

1. Test all 5 steps of the wizard
2. Verify AI analysis recommendations
3. Test state-specific compliance
4. Deploy to AWS for production
5. Add more states and features

---

**Ready to build prenups with confidence! 🚀** 