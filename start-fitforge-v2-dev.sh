#!/bin/bash

# FitForge V2 Systematic Development Environment Startup Script
# Launches the complete development stack with hot reload

echo "🚀 Starting FitForge V2 Systematic Development Environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.fast.yml down

# Start the development stack
echo "🐳 Building and starting development containers..."
docker-compose -f docker-compose.fast.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend ready at http://localhost:3000"
else
    echo "⚠️  Frontend starting... (may take a moment)"
fi

# Check backend
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ Backend API ready at http://localhost:8000"
    echo "📚 API Documentation at http://localhost:8000/docs"
else
    echo "⚠️  Backend starting... (may take a moment)"
fi

# Check database
if pg_isready -h localhost -p 5432 -U fitforge_user > /dev/null 2>&1; then
    echo "✅ Database ready at localhost:5432"
else
    echo "⚠️  Database starting... (may take a moment)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 FitForge V2 Systematic Development Environment Started!"
echo ""
echo "📱 Frontend:      http://localhost:3000"
echo "🔧 Backend API:   http://localhost:8000"
echo "📚 API Docs:      http://localhost:8000/docs"
echo "🗄️  Database:     localhost:5432"
echo ""
echo "💡 Hot reload enabled for both frontend and backend"
echo "📝 Edit code locally and see changes instantly!"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.fast.yml down"
echo "📊 View logs: docker-compose -f docker-compose.fast.yml logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"