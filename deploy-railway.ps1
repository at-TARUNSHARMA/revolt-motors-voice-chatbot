# Revolt Motors Voice Chatbot - Railway Deployment Script (Windows)
# This script automates deployment to Railway platform

Write-Host "🚀 Deploying Revolt Motors Voice Chatbot to Railway..." -ForegroundColor Cyan

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Login to Railway (will prompt for authentication)
Write-Host "🔐 Please login to Railway..." -ForegroundColor Yellow
railway login

# Create a new Railway project
Write-Host "📦 Creating new Railway project..." -ForegroundColor Cyan
railway new

# Deploy the application
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
railway up

Write-Host "" 
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Railway dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Find your deployed app" -ForegroundColor White
Write-Host "3. Go to Variables tab" -ForegroundColor White
Write-Host "4. Add environment variable:" -ForegroundColor White
Write-Host "   GEMINI_API_KEY=your_actual_gemini_api_key" -ForegroundColor Yellow
Write-Host "5. Your app will automatically redeploy" -ForegroundColor White
Write-Host ""
Write-Host "🌍 Your app will be available at the Railway URL shown above!" -ForegroundColor Green
