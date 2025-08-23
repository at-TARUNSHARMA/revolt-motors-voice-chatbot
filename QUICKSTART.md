# 🚀 Quick Start Guide

## Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

## Setup & Run

1. **Configure API Key**
   ```bash
   # Copy the environment file
   copy backend\.env.example backend\.env
   
   # Edit backend\.env and replace with your actual API key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

2. **Start the Application**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Start both backend and frontend
   npm run dev
   ```

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
