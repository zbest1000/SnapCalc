#!/bin/bash

echo "🚀 Setting up SnapCalc - Mobile Calculator Logger"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment configuration..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
fi

# Create public directory and placeholder icons if they don't exist
echo "🎨 Setting up PWA assets..."
mkdir -p public

# Check if real icons exist, if not create placeholders
if [ ! -f public/icon-192x192.png ]; then
    echo "Creating placeholder 192x192 icon..."
    # In a real setup, you'd use a proper image generation tool
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > public/icon-192x192.png
fi

if [ ! -f public/icon-512x512.png ]; then
    echo "Creating placeholder 512x512 icon..."
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > public/icon-512x512.png
fi

# Run type check
echo "🔍 Running TypeScript type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript errors found, but continuing..."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev    - Start development server"
echo "2. npm run build  - Build for production"
echo "3. npm start      - Start production server"
echo ""
echo "The app will be available at: http://localhost:3000"
echo ""
echo "📱 For PWA testing on mobile:"
echo "1. Build and serve the production version"
echo "2. Access via HTTPS (required for camera and PWA features)"
echo "3. Use tools like ngrok for HTTPS tunneling during development"