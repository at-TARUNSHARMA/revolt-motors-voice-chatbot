#!/bin/bash

# Revolt Motors Voice Chatbot - Railway Deployment Script
# This script automates deployment to Railway platform

echo "🚀 Deploying Revolt Motors Voice Chatbot to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (will prompt for authentication)
echo "🔐 Please login to Railway..."
railway login

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Create a new Railway project
echo "📦 Creating new Railway project..."
railway new

# Deploy the application
echo "🚀 Starting deployment..."
railway up

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Find your deployed app"
echo "3. Go to Variables tab"
echo "4. Add environment variable:"
echo "   GEMINI_API_KEY=your_actual_gemini_api_key"
echo "5. Your app will automatically redeploy"
echo ""
echo "🌍 Your app will be available at the Railway URL shown above!"
