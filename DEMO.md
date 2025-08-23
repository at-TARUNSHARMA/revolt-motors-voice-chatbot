# 🎬 Demo Script for Revolt Motors Voice Chatbot

This demo script provides structured conversation examples to showcase all the features of the voice chatbot.

## 🚀 Pre-Demo Setup

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Open browser** to `http://localhost:3000`

3. **Grant microphone permissions** when prompted

4. **Check audio levels** - speak to test microphone input

## 📋 Demo Flow (30-60 seconds)

### Part 1: Connection & Basic Interaction (15 seconds)

**Script**: 
1. "First, I'll connect to the Revolt Motors AI assistant"
2. *Click power button* - Show connection status
3. *Hold microphone button* and say: **"Hi, can you tell me about Revolt Motors?"**
4. *Release and wait for response* - Show AI speaking state

**Expected Response**: AI introduces itself as Rev and explains Revolt Motors basics

### Part 2: Interruption Handling (15 seconds)

**Script**:
1. *Hold microphone and ask*: **"What electric motorcycles do you offer?"**
2. *Wait for AI to start responding*
3. *While AI is speaking, hold microphone again* and say: **"Wait, tell me about the RV400 specifically"**
4. *Show seamless interruption* - AI stops, listens, and responds to new question

**Expected Behavior**: AI immediately stops speaking, processes interruption, responds about RV400

### Part 3: Natural Conversation & Features (20 seconds)

**Script**:
1. Continue conversation: **"How much does it cost?"**
2. Show visual states: recording (red), AI speaking (green)
3. Ask follow-up: **"Where can I buy one?"**
4. Demonstrate responsiveness and low latency

**Expected Response**: AI provides pricing info and purchase locations

### Part 4: Topic Boundaries (10 seconds)

**Script**:
1. Test boundaries: **"Can you tell me about the weather?"**
2. Show AI redirecting: Should politely redirect to Revolt Motors topics
3. *Disconnect* by clicking power button

**Expected Response**: AI politely redirects conversation back to Revolt Motors

## 🎯 Key Features to Highlight

### ✅ Visual Indicators
- **Connection status**: Green dot when connected
- **Recording state**: Red pulsing ring while speaking
- **AI response**: Green pulsing ring while AI speaks
- **Session info**: Shows active session ID

### ✅ Audio Features
- **Low latency**: 1-2 second response time
- **Clear audio**: High-quality speech synthesis
- **Interruption**: Seamless switching between modes
- **Natural conversation**: Context-aware responses

### ✅ User Experience
- **Simple interface**: Just hold to talk
- **Visual feedback**: Clear state indicators
- **Error handling**: Graceful degradation
- **Mobile responsive**: Works on phones/tablets

## 🎤 Sample Conversation Scripts

### Script A: Product Inquiry
```
User: "Tell me about Revolt Motors"
AI: [Introduces company, electric motorcycles]

User: "What models do you have?"
AI: [Lists RV400 series and features]

User: "How does battery swapping work?"
AI: [Explains battery technology and swapping process]
```

### Script B: Purchase Journey
```
User: "I want to buy an electric motorcycle"
AI: [Introduces Revolt options]

User: "What's the price of RV400?"
AI: [Provides pricing information]

User: "Where can I test ride one?"
AI: [Lists dealerships and booking process]
```

### Script C: Technical Questions
```
User: "What's the range of your motorcycles?"
AI: [Explains range and battery capacity]

User: "How long does charging take?"
AI: [Details about charging and swapping options]

User: "What about maintenance?"
AI: [Explains maintenance requirements]
```

## 🎥 Recording the Demo

### Setup for Recording
1. Use screen recording software (OBS, QuickTime, etc.)
2. Record both screen and microphone audio
3. Ensure good microphone quality for clear demo
4. Have stable internet connection

### Recording Checklist
- [ ] Clear audio input (good microphone)
- [ ] Stable internet connection
- [ ] Browser microphone permissions granted
- [ ] Both frontend and backend running
- [ ] Screen recording software ready

### Post-Production Tips
- Keep demo to 30-60 seconds as requested
- Add captions for accessibility
- Highlight key features with annotations
- Show interruption handling clearly
- Include brief setup/connection sequence

## 🐛 Troubleshooting During Demo

### If Connection Fails
- Refresh browser page
- Check backend server is running
- Verify API key is set correctly
- Check browser console for errors

### If Audio Doesn't Work
- Refresh and re-grant microphone permissions
- Check system audio settings
- Try different browser (Chrome recommended)
- Verify HTTPS or localhost usage

### If API Errors Occur
- Check rate limits (15 requests/minute)
- Verify API key is valid
- Switch to backup model if needed
- Have fallback demo strategy ready

## 📊 Demo Success Metrics

The demo should showcase:

1. **Connection Time**: < 3 seconds to establish connection
2. **Response Latency**: < 2 seconds from speech to AI response
3. **Interruption Speed**: < 0.5 seconds to stop and switch
4. **Audio Quality**: Clear, natural-sounding responses
5. **UI Responsiveness**: Smooth state transitions
6. **Topic Adherence**: AI stays focused on Revolt Motors

## 🎬 Alternative Demo Scenarios

### Quick Feature Demo (15 seconds)
Focus on core functionality only:
1. Connect → Ask one question → Show response → Demonstrate interruption

### Detailed Technical Demo (90 seconds)
Extended version showing:
1. Connection process
2. Multiple conversation turns
3. Interruption handling
4. Error handling
5. Disconnection

### Mobile Demo
Same script but recorded on mobile device to show responsive design

---

**🎯 Remember**: The goal is to show a natural, responsive, and intelligent voice interface that feels like talking to a knowledgeable Revolt Motors representative!
