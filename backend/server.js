const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { GoogleGenerativeAI, Modality } = require('@google/generative-ai');
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

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const model = process.env.GEMINI_MODEL || 'gemini-live-2.5-flash-preview';
    
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: REVOLT_SYSTEM_INSTRUCTION,
      // Enable voice activity detection for interruption handling
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Puck" // You can change this to other available voices
          }
        }
      }
    };

    // Connect to Gemini Live API
    const geminiSession = await genAI.live.connect({
      model: model,
      config: config,
      callbacks: {
        onopen: () => {
          console.log(`Gemini session opened for: ${sessionId}`);
          session.ws.send(JSON.stringify({ 
            type: 'session_started',
            sessionId: sessionId 
          }));
        },
        onmessage: (message) => {
          // Forward Gemini responses to client
          if (message.data) {
            session.ws.send(JSON.stringify({
              type: 'audio_response',
              audio: message.data,
              sessionId: sessionId
            }));
          }
          
          // Handle turn completion
          if (message.serverContent && message.serverContent.turnComplete) {
            session.ws.send(JSON.stringify({
              type: 'turn_complete',
              sessionId: sessionId
            }));
          }
        },
        onerror: (error) => {
          console.error(`Gemini session error for ${sessionId}:`, error);
          session.ws.send(JSON.stringify({
            type: 'error',
            message: 'Gemini API error',
            sessionId: sessionId
          }));
        },
        onclose: (reason) => {
          console.log(`Gemini session closed for ${sessionId}:`, reason);
          session.ws.send(JSON.stringify({
            type: 'session_ended',
            reason: reason,
            sessionId: sessionId
          }));
        }
      }
    });

    session.geminiSession = geminiSession;
    session.isConnected = true;

  } catch (error) {
    console.error('Failed to start Gemini session:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to connect to Gemini Live API'
    }));
  }
}

async function handleAudioChunk(sessionId, session, audioData) {
  if (!session.geminiSession || !session.isConnected) {
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Session not connected'
    }));
    return;
  }

  try {
    // Send audio chunk to Gemini
    await session.geminiSession.sendRealtimeInput({
      audio: {
        data: audioData,
        mimeType: "audio/pcm;rate=16000"
      }
    });
  } catch (error) {
    console.error('Failed to send audio to Gemini:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process audio'
    }));
  }
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
