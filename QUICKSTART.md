# 🚀 Quick Start Guide - Gemini Live API

Get your Revolt Motors Voice Chatbot with **real Gemini Live API** running in 5 minutes!

## 📋 Prerequisites

- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)
- **Modern browser** with microphone support

## ⚡ One-Command Setup

```powershell
# Windows: Run automated setup
powershell -ExecutionPolicy Bypass -File setup.ps1

# Manual: Install dependencies
npm run install-all
```

## 🔑 Configure API Key

1. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key (free tier available!)

2. **Add the key to your environment:**
   ```bash
   # Copy the environment template
   copy backend\.env.example backend\.env
   
   # Edit backend\.env and replace with your actual API key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   
   # Choose your model (recommended for testing):
   GEMINI_MODEL=gemini-2.0-flash-live-001
   ```

## 🎬 Start the Application

```bash
# Start both backend and frontend servers
npm run dev
```

This starts:
- **Backend** (Gemini Live API proxy) on `http://localhost:8080`
- **Frontend** (React app) on `http://localhost:3000`

3. **Open Your Browser**
   - Go to `http://localhost:3000`
   - Allow microphone permissions when prompted

## Usage

1. **Connect**: Click the power button (should turn green)
2. **Talk**: Hold the microphone button while speaking
3. **Listen**: Release button and wait for AI response
4. **Interrupt**: Start talking while AI is speaking

## Test Questions

Try asking:
- "Tell me about Revolt Motors"
- "What electric motorcycles do you offer?" 
- "How does battery swapping work?"
- "What's the price of RV400?"

## Troubleshooting

**Can't connect?**
- Check that backend is running on port 8080
- Verify your API key is correct
- Check browser console for errors

**No audio?**
- Allow microphone permissions
- Check system audio settings
- Try refreshing the page

**High latency?**
- Check internet connection
- Try switching to `gemini-2.0-flash-live-001` model for faster responses

## Demo Recording

Record a 30-60 second video showing:
1. Connection process
2. Basic conversation
3. Interruption handling
4. Natural responses

---

**Need help?** Check the full README.md or DEMO.md files for detailed instructions.
