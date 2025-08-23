# 🚀 Deployment Guide

Your Revolt Motors Voice Chatbot is now live on GitHub! Here are the deployment options to make it accessible online.

## 📍 GitHub Repository
**Live Repository**: https://github.com/at-TARUNSHARMA/revolt-motors-voice-chatbot

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)

1. **Fork/Clone** your repository to your local machine
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
3. **Login to Vercel**:
   ```bash
   vercel login
   ```
4. **Deploy** from your project directory:
   ```bash
   vercel
   ```
5. **Set Environment Variables** in Vercel dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NODE_ENV`: production

### Option 2: Netlify + Railway/Render

**Frontend (Netlify)**:
1. Connect your GitHub repo to Netlify
2. Build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`

**Backend (Railway/Render)**:
1. Connect your GitHub repo
2. Set environment variables
3. Deploy backend separately

### Option 3: Heroku (Full-Stack)

1. **Install Heroku CLI** and login
2. **Create Heroku app**:
   ```bash
   heroku create revolt-voice-chatbot
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   heroku config:set NODE_ENV=production
   ```
4. **Add build scripts** to root package.json:
   ```json
   {
     "scripts": {
       "build": "cd frontend && npm install && npm run build",
       "start": "cd backend && npm start",
       "heroku-postbuild": "npm run build"
     }
   }
   ```

### Option 4: Local Network Access

For immediate testing, you can make your local server accessible:

1. **Find your local IP**:
   ```bash
   ipconfig
   ```
2. **Update backend/server.js** to listen on all interfaces:
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```
3. **Update frontend WebSocket connection** in `VoiceChat.tsx`:
   ```javascript
   const ws = new WebSocket('ws://YOUR_LOCAL_IP:8080');
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Backend (.env)
GEMINI_API_KEY=your_actual_api_key
NODE_ENV=production
PORT=8080
CLIENT_URL=https://your-frontend-domain.com

# Production Model (better quality)
GEMINI_MODEL=gemini-2.5-flash-preview-native-audio-dialog
```

### Security Considerations

1. **HTTPS Required**: Voice APIs require secure connections
2. **CORS**: Update CORS settings for your domain
3. **Rate Limiting**: Implement rate limiting for production
4. **API Key Security**: Never expose API keys in frontend

## 📱 Mobile Testing

The app works on mobile devices:
1. Deploy to HTTPS domain
2. Test on actual mobile devices
3. Ensure microphone permissions work

## 🎯 Performance Optimization

### For Production:
1. **Enable compression** in Express
2. **Use CDN** for static assets
3. **Implement audio buffering**
4. **Add error tracking** (Sentry)

### Frontend Optimization:
```javascript
// Add to VoiceChat.tsx for production
const WEBSOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-backend-domain.com'
  : 'ws://localhost:8080';
```

## 🔍 Testing Your Live Application

Once deployed, test:
1. **Connection**: Can connect to voice service
2. **Audio Input**: Microphone works on HTTPS
3. **Audio Output**: Speakers play responses
4. **Interruption**: Can interrupt AI while speaking
5. **Latency**: Response time under 3 seconds
6. **Mobile**: Works on mobile browsers

## 📊 Monitoring

Set up monitoring for:
- **API Usage**: Track Gemini API calls
- **Error Rates**: Monitor WebSocket errors
- **Response Times**: Measure audio latency
- **User Sessions**: Track active conversations

## 🚨 Troubleshooting

**Common Production Issues**:

1. **WebSocket Connection Fails**:
   - Ensure backend supports WebSocket upgrades
   - Check firewall settings
   - Verify HTTPS/WSS protocol

2. **Microphone Access Denied**:
   - Must use HTTPS in production
   - Check browser permissions

3. **High Latency**:
   - Choose geographically close servers
   - Optimize audio buffering
   - Use faster Gemini models

## 💡 Next Steps

1. **Get SSL Certificate** for HTTPS
2. **Set up monitoring** and analytics
3. **Add user authentication** if needed
4. **Implement conversation logging**
5. **Add multiple language support**

---

**Your app is now ready for the world! 🌍**

Repository: https://github.com/at-TARUNSHARMA/revolt-motors-voice-chatbot
