import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Power, Zap } from 'lucide-react';
import AudioProcessor from '../utils/AudioProcessor';
import './VoiceChat.css';

interface VoiceChatProps {}

interface WebSocketMessage {
  type: string;
  audio?: string;
  text?: string;
  sessionId?: string;
  message?: string;
  reason?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      setError('Failed to initialize audio system');
      return null;
    }
  }, []);

  // Play audio response from Gemini Live API
  const playAudioResponse = useCallback(async (audioData: string) => {
    // Stop any currently playing audio first
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current = null;
    }
    
    const audioContext = await initializeAudioContext();
    if (!audioContext) return;

    try {
      setIsSpeaking(true);
      
      // Decode base64 audio data from Gemini Live API
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM data to audio buffer (24kHz, 16-bit for Gemini Live API output)
      const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768;
      }

      // Play the audio
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Store reference to current audio source for interruption
      currentAudioSourceRef.current = source;
      
      source.onended = () => {
        setIsSpeaking(false);
        currentAudioSourceRef.current = null;
      };
      
      source.start();
      console.log('🔊 Playing Gemini Live audio response');
      
    } catch (error) {
      console.error('❌ Error playing Gemini Live audio:', error);
      setIsSpeaking(false);
      currentAudioSourceRef.current = null;
    }
  }, [initializeAudioContext]);

  // Speech synthesis for text responses
  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to find a good voice (prefer female voices for friendliness)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      console.log('Speech started');
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case 'session_started':
          setSessionId(data.sessionId || null);
          setConnectionStatus('Connected');
          setError(null);
          break;
          
        case 'audio_response':
          if (data.audio) {
            playAudioResponse(data.audio);
          }
          break;
          
        case 'speech_response':
          if (data.text) {
            speakText(data.text);
          }
          break;
          
        case 'turn_complete':
          setIsSpeaking(false);
          break;
          
        case 'session_ended':
          setConnectionStatus('Session ended');
          break;
          
        case 'error':
          setError(data.message || 'Unknown error occurred');
          setConnectionStatus('Error');
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [playAudioResponse, speakText]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('Connecting...');
      setError(null);

      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('Connected');
        
        // Start session
        ws.send(JSON.stringify({ type: 'start_session' }));
      };
      
      ws.onmessage = handleWebSocketMessage;
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.reason);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        setSessionId(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setConnectionStatus('Connection Error');
      };
      
      wsRef.current = ws;
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setError('Failed to connect to server');
      setConnectionStatus('Connection Failed');
    }
  }, [handleWebSocketMessage]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
      audioProcessorRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setConnectionStatus('Disconnected');
    setSessionId(null);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to server');
      return;
    }

    try {
      setError(null);
      
      // Stop any current playback when user starts speaking (interruption handling)
      if (isSpeaking) {
        console.log('🛑 Interrupting AI response');
        setIsSpeaking(false);
        
        // Stop speech synthesis
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
        // Stop current audio source
        if (currentAudioSourceRef.current) {
          currentAudioSourceRef.current.stop();
          currentAudioSourceRef.current = null;
        }
        
        // Suspend and resume audio context to clear any ongoing audio
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          audioContextRef.current.suspend().then(() => {
            audioContextRef.current?.resume();
          });
        }
      }
      
      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor();
      }
      
      await audioProcessorRef.current.startRecording((audioData: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            audio: audioData
          }));
        }
      });
      
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone');
    }
  }, [isSpeaking]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stopRecording();
    }
    setIsRecording(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnectWebSocket]);

  return (
    <div className="voice-chat-container">
      <div className="voice-chat-card">
        {/* Header */}
        <div className="header">
          <div className="brand">
            <Zap className="brand-icon" />
            <h1>Rev</h1>
            <span className="subtitle">Revolt Motors AI Assistant</span>
          </div>
          <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{connectionStatus}</span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="main-interface">
          <div className="audio-visualizer">
            <div className={`pulse-ring ${isRecording ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}>
              <div className="pulse-ring-inner">
                {isSpeaking ? <Volume2 size={32} /> : <Mic size={32} />}
              </div>
            </div>
          </div>

          <div className="controls">
            <button
              className={`mic-button ${isRecording ? 'recording' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={!isConnected}
              title={isRecording ? 'Release to stop' : 'Hold to talk'}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </button>

            <button
              className={`power-button ${isConnected ? 'connected' : 'disconnected'}`}
              onClick={isConnected ? disconnectWebSocket : connectWebSocket}
              disabled={connectionStatus === 'Connecting...'}
              title={isConnected ? 'Disconnect' : 'Connect'}
            >
              <Power />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {sessionId && (
          <div className="session-info">
            <span>Session: {sessionId.substring(0, 8)}...</span>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <p>🎤 Hold the microphone button to speak</p>
          <p>🔊 I'll respond with audio automatically</p>
          <p>⚡ Ask me anything about Revolt Motors!</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
