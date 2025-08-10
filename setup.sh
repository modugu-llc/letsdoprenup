#!/bin/bash

# Let's Do Prenup - Enhanced Platform Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Let's Do Prenup Enhanced Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm $(npm -v) is installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. DynamoDB Local will not be available."
    DOCKER_AVAILABLE=false
else
    print_success "Docker $(docker --version) is installed"
    DOCKER_AVAILABLE=true
fi

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Start DynamoDB Local if Docker is available
if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Starting DynamoDB Local..."
    
    # Stop and remove existing container if it exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "dynamodb-local"; then
        print_status "Removing existing DynamoDB Local container..."
        docker rm -f dynamodb-local > /dev/null 2>&1
    fi
    
    # Start new container
    docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory
    
    if [ $? -eq 0 ]; then
        print_success "DynamoDB Local started successfully"
        
        # Wait for DynamoDB to be ready
        print_status "Waiting for DynamoDB Local to be ready..."
        sleep 5
        
        # Test DynamoDB connection
        if curl -s http://localhost:8000/shell > /dev/null 2>&1; then
            print_success "DynamoDB Local is responding"
        else
            print_warning "DynamoDB Local may not be ready yet. You may need to wait a moment."
        fi
    else
        print_error "Failed to start DynamoDB Local"
        exit 1
    fi
else
    print_warning "Docker not available. Please start DynamoDB Local manually or use AWS DynamoDB."
fi

# Set up database tables
if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Setting up database tables..."
    cd backend
    npm run setup:tables
    
    if [ $? -eq 0 ]; then
        print_success "Database tables created successfully"
    else
        print_error "Failed to create database tables"
        exit 1
    fi
    
    cd ..
fi

# Create environment files if they don't exist
print_status "Setting up environment configuration..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# DynamoDB Configuration
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=letsdoprenup-data
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local

# Application Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
EOF
    print_success "Created backend/.env file"
else
    print_status "backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# Frontend Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Let's Do Prenup
EOF
    print_success "Created frontend/.env file"
else
    print_status "frontend/.env already exists"
fi

# Build the application
print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development servers:"
echo "   npm run dev"
echo ""
echo "2. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   DynamoDB Local Admin: http://localhost:8000/shell"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🧪 Testing the application:"
echo "1. Open http://localhost:3000"
echo "2. Register a new account"
echo "3. Create a new prenup"
echo "4. Test the 5-step wizard process"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
print_success "Setup complete! 🚀"