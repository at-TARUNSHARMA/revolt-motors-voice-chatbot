const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { GoogleGenAI } = require('@google/genai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Gemini Live API client
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction for Revolt Motors
const REVOLT_SYSTEM_INSTRUCTION = `You are Rev, the official voice assistant for Revolt Motors - India's leading electric motorcycle manufacturer. 

IMPORTANT INSTRUCTIONS:
- You ONLY discuss topics related to Revolt Motors, electric motorcycles, sustainability, and related automotive topics
- If asked about anything else, politely redirect the conversation back to Revolt Motors
- Be enthusiastic, knowledgeable, and helpful about Revolt Motors products and services
- Speak naturally and conversationally, as if you're a friendly motorcycle expert
- Keep responses concise but informative
- If you don't know specific details about Revolt Motors, acknowledge it honestly but stay on topic

ABOUT REVOLT MOTORS:
- Founded in India, pioneering electric mobility
- Known for smart, connected electric motorcycles
- Focus on sustainability and cutting-edge technology
- Offers models like RV400 series with swappable batteries
- Committed to making electric mobility accessible and exciting

Always maintain a friendly, enthusiastic tone while staying focused on Revolt Motors and electric mobility topics.`;

// Store active sessions
const activeSessions = new Map();

// WebSocket server for handling real-time audio
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const sessionId = uuidv4();
  console.log(`New WebSocket connection established: ${sessionId}`);
  
  // Store session info
  activeSessions.set(sessionId, {
    ws,
    geminiSession: null,
    isConnected: false
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const session = activeSessions.get(sessionId);
      
      if (!session) {
        ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
        return;
      }

      switch (data.type) {
        case 'start_session':
          await handleStartSession(sessionId, session);
          break;
        
        case 'audio_chunk':
          await handleAudioChunk(sessionId, session, data.audio);
          break;
        
        case 'text_query':
          await processTextQuery(sessionId, session, data.text);
          break;
          
        case 'end_session':
          await handleEndSession(sessionId, session);
          break;
        
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message' 
      }));
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket connection closed: ${sessionId}`);
    handleEndSession(sessionId, activeSessions.get(sessionId));
    activeSessions.delete(sessionId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for session ${sessionId}:`, error);
  });
});

async function handleStartSession(sessionId, session) {
  try {
    // Initialize Gemini model for text-based responses
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: REVOLT_SYSTEM_INSTRUCTION
    });

    session.geminiModel = model;
    session.isConnected = true;
    session.audioBuffer = [];

    console.log(`Session started for: ${sessionId}`);
    session.ws.send(JSON.stringify({ 
      type: 'session_started',
      sessionId: sessionId 
    }));

  } catch (error) {
    console.error('Failed to start session:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to initialize AI model'
    }));
  }
}

async function handleAudioChunk(sessionId, session, audioData) {
  if (!session.geminiModel || !session.isConnected) {
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Session not connected'
    }));
    return;
  }

  try {
    // For now, we'll buffer audio chunks and process them when recording stops
    session.audioBuffer.push(audioData);
    
    // Simulate processing - in a real implementation, you would:
    // 1. Convert audio to text using Speech-to-Text API
    // 2. Send text to Gemini
    // 3. Convert Gemini's response back to audio using Text-to-Speech API
    
    // For demo purposes, let's trigger a response after a few chunks
    if (session.audioBuffer.length >= 10) {
      await processAudioBuffer(sessionId, session);
    }
    
  } catch (error) {
    console.error('Failed to process audio:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process audio'
    }));
  }
}

async function processAudioBuffer(sessionId, session, userQuery = null) {
  try {
    // Clear the buffer
    session.audioBuffer = [];
    
    // If no user query provided, use a placeholder for now
    // In a real implementation, you would convert the audio buffer to text using Speech-to-Text API
    const userPrompt = userQuery || "Tell me about Revolt Motors electric motorcycles in 2-3 sentences.";
    
    console.log(`Processing query for ${sessionId}: ${userPrompt}`);
    
    const result = await session.geminiModel.generateContent(userPrompt);
    const responseText = result.response.text();
    
    console.log(`Generated response for ${sessionId}: ${responseText}`);
    
    // Send text response for speech synthesis
    session.ws.send(JSON.stringify({
      type: 'speech_response',
      text: responseText,
      sessionId: sessionId
    }));
    
    // Send turn complete after a short delay to allow speech to start
    setTimeout(() => {
      session.ws.send(JSON.stringify({
        type: 'turn_complete',
        sessionId: sessionId
      }));
    }, 500);
    
  } catch (error) {
    console.error('Failed to process audio buffer:', error);
    
    // Handle rate limiting gracefully
    if (error.status === 429) {
      session.ws.send(JSON.stringify({
        type: 'speech_response',
        text: 'I apologize, but I\'m currently experiencing high demand. Please try again in a moment. In the meantime, I\'d be happy to tell you that Revolt Motors offers amazing electric motorcycles with swappable batteries!',
        sessionId: sessionId
      }));
    } else {
      session.ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate response'
      }));
    }
  }
}

// Generate dummy audio data for demonstration
function generateDummyAudioData() {
  // Generate a simple sine wave for demo purposes
  const sampleRate = 24000;
  const duration = 2; // seconds
  const samples = sampleRate * duration;
  const buffer = new ArrayBuffer(samples * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
    view.setInt16(i * 2, sample * 32767, true);
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return Buffer.from(binary, 'binary').toString('base64');
}

async function handleEndSession(sessionId, session) {
  if (session && session.geminiSession) {
    try {
      session.geminiSession.close();
      session.isConnected = false;
    } catch (error) {
      console.error('Error closing Gemini session:', error);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions.size
  });
});

// Get session info
app.get('/api/sessions', (req, res) => {
  res.json({
    activeSessions: activeSessions.size,
    sessions: Array.from(activeSessions.keys())
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Revolt Motors Voice Chatbot Server running on port ${PORT}`);
  console.log(`📱 WebSocket server ready for connections`);
  console.log(`🤖 Using Gemini model: ${process.env.GEMINI_MODEL || 'gemini-live-2.5-flash-preview'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
