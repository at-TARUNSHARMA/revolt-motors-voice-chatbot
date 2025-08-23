# 🎤 Revolt Motors Voice Chatbot

A real-time conversational voice interface using Google's Gemini Live API, designed to replicate the functionality of the Revolt Motors chatbot. Features natural, human-like conversations with support for multiple languages, interruption handling, and low-latency responses.

## 🎯 Features

- **Real-time Voice Conversation**: Seamless audio streaming with 1-2 second response latency
- **Interruption Handling**: AI stops speaking when user starts talking, switches smoothly to listening mode
- **Natural Dialogue**: Human-like conversations with emotion-aware responses
- **Revolt Motors Focused**: AI assistant specifically trained to discuss Revolt Motors products and services
- **Modern UI**: Clean, responsive interface with visual feedback for recording and playback states
- **Server-to-Server Architecture**: Secure backend proxy to Gemini Live API
- **Multi-language Support**: Supports multiple languages through Gemini's native capabilities

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    WebSocket    ┌─────────────────┐
│                 │ ←─────────────→ │                 │ ←─────────────→ │                 │
│  React Frontend │                 │  Node.js Server │                 │  Gemini Live    │
│                 │                 │                 │                 │      API        │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
      Audio I/O                          Proxy Layer                         AI Processing
```

### Components:
- **Frontend**: React TypeScript app with real-time audio processing
- **Backend**: Node.js/Express server with WebSocket support
- **Audio Processing**: Browser APIs for microphone input and speaker output
- **AI Integration**: Google Gemini Live API for conversational responses

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Gemini API Key** from Google AI Studio
- **Modern browser** with microphone support
- **HTTPS/Localhost** (required for microphone access)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd revolt-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` with your configuration:
   ```env
   # Required: Get your API key from https://aistudio.google.com/
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Server Configuration
   PORT=8080
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # Model Selection
   # Production: gemini-2.5-flash-preview-native-audio-dialog
   # Development: gemini-live-2.5-flash-preview (recommended)
   # Testing: gemini-2.0-flash-live-001
   GEMINI_MODEL=gemini-live-2.5-flash-preview
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This starts both:
   - Backend server on `http://localhost:8080`
   - Frontend app on `http://localhost:3000`

5. **Test the application**
   - Open your browser to `http://localhost:3000`
   - Allow microphone permissions when prompted
   - Click the power button to connect
   - Hold the microphone button to speak

## 🛠️ Manual Setup

### Backend Server

```bash
cd backend
npm install
npm run dev
```

### Frontend Application

```bash
cd frontend
npm install
npm start
```

## 🎮 How to Use

1. **Connect**: Click the power button to establish connection
2. **Talk**: Hold down the microphone button while speaking
3. **Listen**: Release the button and wait for AI response
4. **Interrupt**: Start speaking while AI is talking to interrupt
5. **Disconnect**: Click the power button again to end session

### Voice Commands Examples
- "Tell me about Revolt Motors"
- "What electric motorcycles do you offer?"
- "How does the battery swapping work?"
- "What's the price of RV400?"
- "Where can I buy a Revolt motorcycle?"

## 🔧 Configuration

### Model Selection

Choose the appropriate model based on your needs:

| Model | Use Case | Features |
|-------|----------|----------|
| `gemini-2.5-flash-preview-native-audio-dialog` | Production | Best quality, native audio, emotion-aware |
| `gemini-live-2.5-flash-preview` | Development | Good quality, reliable, recommended for testing |
| `gemini-2.0-flash-live-001` | Testing | Basic functionality, API testing |

### Audio Configuration

The system automatically optimizes audio for Gemini Live API:
- **Input**: 16kHz, 16-bit PCM, mono
- **Output**: 24kHz, 16-bit PCM, mono
- **Latency**: Optimized for 1-2 second response time

## 🧪 Testing Strategy

### Free Tier Limitations
- **Rate Limits**: 15 requests per minute, 1500 per day
- **Session Duration**: Limited to prevent quota exhaustion
- **Testing Approach**: Use short, focused conversations

### Testing Checklist
- [ ] Microphone permissions granted
- [ ] WebSocket connection established
- [ ] Audio recording works
- [ ] Audio playback works
- [ ] Interruption handling functional
- [ ] Error handling for network issues
- [ ] Responsive design on mobile

### Performance Monitoring

The backend provides monitoring endpoints:

```bash
# Health check
curl http://localhost:8080/health

# Active sessions
curl http://localhost:8080/api/sessions
```

## 🎨 UI Components

### Main Interface
- **Audio Visualizer**: Central pulse ring showing recording/speaking states
- **Control Buttons**: Microphone (hold to talk) and power (connect/disconnect)
- **Status Indicators**: Connection status and error messages
- **Session Info**: Current session ID display

### Visual States
- **Idle**: Blue gradient pulse ring
- **Recording**: Red pulsing animation with microphone icon
- **Speaking**: Green pulsing animation with speaker icon
- **Error**: Red error message with warning icon

## 🔒 Security Considerations

### API Key Protection
- API keys are stored server-side only
- No client-side exposure of credentials
- Environment variable configuration

### Audio Privacy
- Audio is processed in real-time, not stored
- Session data is not persisted
- Microphone access requires explicit user consent

### CORS Configuration
- Restricted to allowed origins
- Configurable client URLs
- Secure WebSocket connections

## 🐛 Troubleshooting

### Common Issues

**"Microphone access denied"**
- Grant microphone permissions in browser
- Ensure HTTPS or localhost usage
- Check browser privacy settings

**"Failed to connect to server"**
- Verify backend server is running on port 8080
- Check firewall settings
- Confirm WebSocket connection

**"Gemini API error"**
- Verify API key is correct and active
- Check rate limits and quotas
- Ensure model name is valid

**High latency responses**
- Check internet connection speed
- Verify server location/region
- Consider switching to faster model

### Debug Mode

Enable debug logging:

```bash
# Backend
NODE_ENV=development npm run dev

# Check browser console for frontend logs
```

## 📊 Performance Metrics

### Target Performance
- **Connection Time**: < 3 seconds
- **Audio Latency**: < 1 second recording to AI response
- **UI Responsiveness**: < 100ms for user interactions
- **Memory Usage**: < 50MB frontend, < 100MB backend

### Optimization Tips
- Use WebSocket for low-latency communication
- Implement audio buffering for smooth playback
- Optimize bundle size with code splitting
- Use efficient audio encoding formats

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Meaningful commit messages

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini Live API** for conversational AI capabilities
- **Revolt Motors** for inspiration and branding
- **React Community** for excellent tooling and libraries
- **Node.js Ecosystem** for robust backend development

## 📞 Support

For issues and questions:
1. Check this README and troubleshooting section
2. Review browser console for error messages
3. Verify API key and network connectivity
4. Open an issue on GitHub with detailed logs

---

**Made with ❤️ for Revolt Motors** - Revolutionizing electric mobility through AI-powered conversations.
