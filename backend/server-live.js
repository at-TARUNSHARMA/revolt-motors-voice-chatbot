const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { GoogleGenAI, Modality } = require('@google/genai');
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
- Keep responses concise but informative (2-3 sentences max per response)
- If you don't know specific details about Revolt Motors, acknowledge it honestly but stay on topic

ABOUT REVOLT MOTORS:
- Founded in India, pioneering electric mobility
- Known for smart, connected electric motorcycles
- Focus on sustainability and cutting-edge technology
- Offers models like RV400 series with swappable batteries
- Features like mobile app integration, GPS tracking, theft protection
- Committed to making electric mobility accessible and exciting
- Revolutionary battery swapping technology for quick charging

Always maintain a friendly, enthusiastic tone while staying focused on Revolt Motors and electric mobility topics.`;

// Model configuration
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash-live-001';

const LIVE_CONFIG = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: REVOLT_SYSTEM_INSTRUCTION
};

// Store active sessions
const activeSessions = new Map();

// WebSocket server for handling real-time audio
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const sessionId = uuidv4();
  console.log(`🔗 New WebSocket connection established: ${sessionId}`);
  
  // Store session info
  activeSessions.set(sessionId, {
    ws,
    geminiSession: null,
    isConnected: false,
    isProcessing: false,
    audioBuffer: []
  });

  // Send initial session info
  ws.send(JSON.stringify({
    type: 'connection_established',
    sessionId: sessionId
  }));

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
        
        case 'text_message':
          await handleTextMessage(sessionId, session, data.text);
          break;
        
        case 'stop_recording':
          await handleStopRecording(sessionId, session);
          break;
          
        case 'end_session':
          await handleEndSession(sessionId, session);
          break;
        
        default:
          console.log('❓ Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message' 
      }));
    }
  });

  ws.on('close', () => {
    console.log(`🔌 WebSocket connection closed: ${sessionId}`);
    handleEndSession(sessionId, activeSessions.get(sessionId));
    activeSessions.delete(sessionId);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for session ${sessionId}:`, error);
  });
});

async function handleStartSession(sessionId, session) {
  try {
    console.log(`🚀 Starting Gemini Live session for: ${sessionId}`);
    
    // Connect to Gemini Live API
    const liveSession = await genai.live.connect({
      model: MODEL_NAME,
      config: LIVE_CONFIG,
      callbacks: {
        onopen: function() {
          console.log(`✅ Gemini Live session opened for ${sessionId}`);
        },
        onmessage: function(message) {
          handleGeminiMessage(sessionId, session, message);
        },
        onerror: function(error) {
          console.error(`❌ Gemini Live error for ${sessionId}:`, error);
          session.ws.send(JSON.stringify({
            type: 'error',
            message: 'Gemini Live connection error'
          }));
        },
        onclose: function(reason) {
          console.log(`🔌 Gemini Live session closed for ${sessionId}:`, reason);
        }
      }
    });

    session.geminiSession = liveSession;
    session.isConnected = true;

    session.ws.send(JSON.stringify({ 
      type: 'session_started',
      sessionId: sessionId 
    }));

  } catch (error) {
    console.error('❌ Failed to start Gemini Live session:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to connect to Gemini Live API: ${error.message}`
    }));
  }
}

function handleGeminiMessage(sessionId, session, message) {
  try {
    if (message.data) {
      // Buffer audio chunks instead of playing immediately
      if (!session.audioResponseBuffer) {
        session.audioResponseBuffer = [];
      }
      session.audioResponseBuffer.push(message.data);
      console.log(`🎵 Buffering audio chunk for ${sessionId} (${session.audioResponseBuffer.length} chunks)`);
    }

    if (message.serverContent && message.serverContent.modelTurn) {
      // Text content (for debugging)
      const parts = message.serverContent.modelTurn.parts;
      for (const part of parts) {
        if (part.text) {
          console.log(`🤖 Gemini text response for ${sessionId}:`, part.text);
        }
      }
    }

    if (message.serverContent && message.serverContent.turnComplete) {
      // Combine all audio chunks and send as one response
      if (session.audioResponseBuffer && session.audioResponseBuffer.length > 0) {
        console.log(`🔊 Sending combined audio response with ${session.audioResponseBuffer.length} chunks for ${sessionId}`);
        
        // Combine all base64 audio chunks
        const combinedAudio = session.audioResponseBuffer.join('');
        
        session.ws.send(JSON.stringify({
          type: 'audio_response',
          audio: combinedAudio,
          sessionId: sessionId
        }));
        
        // Clear the buffer
        session.audioResponseBuffer = [];
      }
      
      // Turn is complete
      session.ws.send(JSON.stringify({
        type: 'turn_complete',
        sessionId: sessionId
      }));
      session.isProcessing = false;
    }

  } catch (error) {
    console.error('❌ Error handling Gemini message:', error);
  }
}

async function handleAudioChunk(sessionId, session, audioData) {
  if (!session.geminiSession || !session.isConnected) {
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Gemini Live session not connected'
    }));
    return;
  }

  try {
    // Buffer audio chunks
    session.audioBuffer.push(audioData);
    
    // Send audio data to Gemini Live API
    await session.geminiSession.sendRealtimeInput({
      audio: {
        data: audioData,
        mimeType: "audio/pcm;rate=16000"
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to send audio to Gemini:', error);
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process audio'
    }));
  }
}

async function handleTextMessage(sessionId, session, text) {
  if (!session.geminiSession || !session.isConnected) {
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Gemini Live session not connected'
    }));
    return;
  }

  try {
    console.log(`💬 Processing text message for ${sessionId}: ${text}`);
    session.isProcessing = true;
    
    // Send text input to Gemini Live API
    await session.geminiSession.sendRealtimeInput({
      text: text
    });
    
  } catch (error) {
    console.error('❌ Failed to send text to Gemini:', error);
    session.isProcessing = false;
    session.ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process text message'
    }));
  }
}

async function handleStopRecording(sessionId, session) {
  if (!session.geminiSession || !session.isConnected) {
    return;
  }

  try {
    // Process accumulated audio buffer if needed
    if (session.audioBuffer.length > 0) {
      console.log(`🎙️ Processing ${session.audioBuffer.length} audio chunks for ${sessionId}`);
      session.audioBuffer = []; // Clear buffer
      session.isProcessing = true;
    }
    
  } catch (error) {
    console.error('❌ Error processing stop recording:', error);
  }
}

async function handleEndSession(sessionId, session) {
  if (session && session.geminiSession) {
    try {
      console.log(`🛑 Ending session: ${sessionId}`);
      await session.geminiSession.close();
      session.isConnected = false;
      session.isProcessing = false;
      session.audioBuffer = [];
    } catch (error) {
      console.error('❌ Error closing Gemini Live session:', error);
    }
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeSessions: activeSessions.size,
    geminiModel: MODEL_NAME
  });
});

// Get session info
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([id, session]) => ({
    id: id.substring(0, 8),
    connected: session.isConnected,
    processing: session.isProcessing,
    bufferSize: session.audioBuffer.length
  }));

  res.json({
    activeSessions: activeSessions.size,
    sessions: sessions
  });
});

// Test endpoint for text-only interaction
app.post('/api/test-message', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let response = '';
    
    const messagePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, 10000);

      // Create a temporary session for testing with callbacks
      genai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.TEXT],
          systemInstruction: REVOLT_SYSTEM_INSTRUCTION
        },
        callbacks: {
          onmessage: function(message) {
            if (message.serverContent && message.serverContent.modelTurn) {
              const parts = message.serverContent.modelTurn.parts;
              for (const part of parts) {
                if (part.text) {
                  response += part.text;
                }
              }
            }

            if (message.serverContent && message.serverContent.turnComplete) {
              clearTimeout(timeout);
              resolve();
            }
          },
          onerror: function(error) {
            clearTimeout(timeout);
            reject(error);
          }
        }
      }).then(testSession => {
        // Send the message once connected
        testSession.sendRealtimeInput({ text: message })
          .catch(error => {
            clearTimeout(timeout);
            reject(error);
          });
      }).catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Send the message
    await testSession.sendRealtimeInput({ text: message });
    
    // Wait for response
    await messagePromise;
    
    // Close the session
    await testSession.close();

    res.json({ response: response.trim() });

  } catch (error) {
    console.error('❌ Test message error:', error);
    res.status(500).json({ 
      error: 'Failed to process test message',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Revolt Motors Voice Chatbot Server running on port ${PORT}`);
  console.log(`📱 WebSocket server ready for connections`);
  console.log(`🤖 Using Gemini Live model: ${MODEL_NAME}`);
  console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not set in environment variables');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  // Close all active sessions
  for (const [sessionId, session] of activeSessions.entries()) {
    handleEndSession(sessionId, session);
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  // Close all active sessions
  for (const [sessionId, session] of activeSessions.entries()) {
    handleEndSession(sessionId, session);
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
