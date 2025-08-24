# Revolt Motors Chatbot Setup Script
# This script sets up the development environment for the voice chatbot

Write-Host "🚀 Setting up Revolt Motors Voice Chatbot..." -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Go back to root directory
cd ..

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Go back to root directory
cd ..

Write-Host "" 
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your Gemini API key from https://aistudio.google.com/" -ForegroundColor White
Write-Host "2. Edit backend/.env and replace 'your_gemini_api_key_here' with your actual API key" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both servers" -ForegroundColor White
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "5. Allow microphone permissions when prompted" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Available commands:" -ForegroundColor Cyan
Write-Host "  npm run dev       - Start both frontend and backend in development mode" -ForegroundColor White
Write-Host "  npm run start     - Start both servers in production mode" -ForegroundColor White
Write-Host "  npm run test      - Test the API connection" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more information, see README.md" -ForegroundColor Cyan
