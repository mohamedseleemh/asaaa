#!/bin/bash

# KYC Trust Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint:check

# Build the project
echo "🏗️ Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed successfully!"
echo "🎉 Your site is now live!"
