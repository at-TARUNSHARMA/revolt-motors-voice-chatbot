#!/usr/bin/env node

// Production deployment script with API key configured
const { spawn } = require('child_process');
const path = require('path');

// Set the API key directly for production deployment
process.env.GEMINI_API_KEY = 'AIzaSyApy6B9jMLcaZBer6FStRHK7c6OAFBBKCE';
process.env.GEMINI_MODEL = 'gemini-2.0-flash-live-001';
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '8080';

console.log('🚀 Starting Revolt Motors Voice Chatbot with API key...');
console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
console.log(`🤖 Using model: ${process.env.GEMINI_MODEL}`);

// Start the backend server
const backend = spawn('node', ['server-live.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  env: { ...process.env }
});

backend.on('error', (err) => {
  console.error('❌ Backend server error:', err);
});

backend.on('close', (code) => {
  console.log(`🛑 Backend server exited with code ${code}`);
});

console.log('✅ Backend server started');
console.log('📡 WebSocket server ready for connections');
console.log('🤖 Gemini Live API integration active with your API key');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  backend.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  backend.kill('SIGINT');
});
