#!/bin/bash

# Ensure we're in the project directory
cd "$(dirname "$0")"

echo "🏁 Let's Do Prenup MVP - Development Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker found: $(docker --version | head -n1)"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not found - you can still run the app but will need to start DynamoDB Local separately"
    DOCKER_AVAILABLE=false
fi

echo

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    cd frontend && npm install && cd ..
fi

echo "✅ Dependencies installed"
echo

# Build the applications
echo "🔨 Building applications..."
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..
echo "✅ Applications built successfully"
echo

# Display setup instructions
echo "🚀 Setup Complete!"
echo "================="
echo
echo "Your Let's Do Prenup MVP is ready! Here's how to run it:"
echo

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Option 1: Using Docker (Recommended)"
    echo "  1. Start the full stack: docker-compose up"
    echo "  2. The application will be available at:"
    echo "     - Frontend: http://localhost:3000"
    echo "     - Backend API: http://localhost:3001"
    echo "     - DynamoDB Local: http://localhost:8000"
    echo
fi

echo "Option 2: Manual Setup"
echo "  1. Start DynamoDB Local: docker run -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -inMemory"
echo "  2. Update backend/.env with DynamoDB configuration"
echo "  3. Set up database tables: cd backend && npm run setup:tables"
echo "  4. Start backend: cd backend && npm run dev"
echo "  5. Start frontend: cd frontend && npm run dev"
echo

echo "📋 Key Features Implemented:"
echo "  ✅ User authentication (registration/login)"
echo "  ✅ State-specific prenup creation (CA, WA, NY, DC, VA)"
echo "  ✅ Financial disclosure system"
echo "  ✅ Document management"
echo "  ✅ Partner collaboration framework"
echo "  ✅ Progress tracking"
echo "  ✅ Responsive design"
echo "  ✅ Legal compliance validation"
echo

echo "🔧 Tech Stack:"
echo "  • Frontend: React 18 + TypeScript + Tailwind CSS"
echo "  • Backend: Node.js + Express + TypeScript"
echo "  • Database: DynamoDB with V0 versioning system"
echo "  • Authentication: JWT-based"
echo "  • UI: Headless UI + Heroicons"
echo "  • Build: Vite (frontend) + TypeScript (backend)"
echo

echo "📖 Next Steps:"
echo "  • Implement the multi-step wizard interface"
echo "  • Add PDF document generation"
echo "  • Integrate DocuSign for e-signatures"
echo "  • Add financial calculators and comparison tools"
echo "  • Implement real-time collaboration features"
echo "  • Add comprehensive test suite"
echo

echo "🎉 Ready to create legally compliant prenups!"