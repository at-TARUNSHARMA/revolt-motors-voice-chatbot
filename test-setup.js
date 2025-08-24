#!/usr/bin/env node

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Gemini Live API Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ backend/.env file not found!');
    console.log('📝 Please create backend/.env from backend/.env.example');
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ GEMINI_API_KEY not configured!');
    console.log('🔑 Please set your actual Gemini API key in backend/.env');
    console.log('   Get it from: https://aistudio.google.com/');
    process.exit(1);
}

console.log('✅ Environment file found');
console.log('✅ API key configured');
console.log(`🤖 Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-live-001'}\n`);

// Test API connection
async function testConnection() {
    try {
        console.log('🔌 Testing Gemini Live API connection...');
        
        const genai = new GoogleGenAI();
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-live-001';
        
        // Create a test session
        const session = await genai.live.connect({
            model: model,
            config: {
                responseModalities: ['TEXT'],
                systemInstruction: 'You are a helpful assistant. Respond briefly.'
            }
        });

        let response = '';
        let timeout;
        
        const responsePromise = new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
                reject(new Error('Response timeout - API might be slow'));
            }, 15000);

            session.callbacks = {
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
            };
        });

        // Send test message
        await session.sendRealtimeInput({ 
            text: 'Hello! Just say "Hello from Revolt Motors" to test the connection.' 
        });
        
        // Wait for response
        await responsePromise;
        
        // Close session
        await session.close();

        console.log('✅ Gemini Live API connection successful!');
        console.log(`🤖 Response: ${response.trim()}\n`);
        
        return true;

    } catch (error) {
        console.error('❌ Gemini Live API test failed:');
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.error('   🔑 Invalid API key - please check your GEMINI_API_KEY in backend/.env');
        } else if (error.message.includes('429') || error.message.includes('quota')) {
            console.error('   ⏰ Rate limit exceeded - please try again in a few minutes');
        } else if (error.message.includes('timeout')) {
            console.error('   🐌 Response timeout - API might be experiencing high load');
        } else {
            console.error(`   💥 ${error.message}`);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify your API key at https://aistudio.google.com/');
        console.log('   2. Check your internet connection');
        console.log('   3. Try a different model (gemini-2.0-flash-live-001)');
        console.log('   4. Wait a few minutes and try again\n');
        
        return false;
    }
}

// Check Node.js version
function checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.split('.')[0].substring(1));
    
    if (majorVersion < 18) {
        console.error(`❌ Node.js ${version} detected - please upgrade to Node.js 18+`);
        console.log('   Download from: https://nodejs.org/');
        process.exit(1);
    }
    
    console.log(`✅ Node.js ${version} (compatible)`);
}

// Check dependencies
function checkDependencies() {
    try {
        require('@google/genai');
        console.log('✅ @google/genai package installed');
    } catch (error) {
        console.error('❌ Missing @google/genai package');
        console.log('   Run: cd backend && npm install');
        process.exit(1);
    }
}

// Main test function
async function runTests() {
    console.log('🔍 System Check:');
    checkNodeVersion();
    checkDependencies();
    
    console.log('\n📡 API Test:');
    const apiWorking = await testConnection();
    
    if (apiWorking) {
        console.log('🎉 All tests passed! Your setup is ready.');
        console.log('\n🚀 Next steps:');
        console.log('   1. Run: npm run dev');
        console.log('   2. Open: http://localhost:3000');
        console.log('   3. Allow microphone permissions');
        console.log('   4. Click power button to connect');
        console.log('   5. Hold mic button and say "Tell me about Revolt Motors"');
    } else {
        console.log('❌ Setup needs attention - please fix the issues above and try again');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test runner error:', error.message);
    process.exit(1);
});
