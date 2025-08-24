#!/usr/bin/env node

// Production start script for Revolt Motors Voice Chatbot
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Revolt Motors Voice Chatbot in production mode...');

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

console.log('✅ Backend server started on port 8080');
console.log('📡 WebSocket server ready for connections');
console.log('🤖 Gemini Live API integration active');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  backend.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  backend.kill('SIGINT');
});
