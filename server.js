//Libraries
//express → Web server banane ke liye.
//cors → Cross-Origin Resource Sharing allow karne ke liye (frontend aur backend connection).
//@google/generative-ai → Google Gemini API ko use karne ke liye.
//path → File aur directory path handle karne ke liye (Node.js built-in).
const express = require('express');  //Library
const cors = require('cors');  //Library
const { GoogleGenerativeAI } = require('@google/generative-ai');  //Library
const path = require('path');   //Library

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

//Gemini API key
const API_KEY = "AIzaSyBYnQi_0ARDIrlIaGw--ETJ6MgpSQgUXDE";

// Validate API key on startup
if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error(' ERROR: Please set your Gemini API key in server.js');
    process.exit(1);
}

let genAI;
try {
    genAI = new GoogleGenerativeAI(API_KEY);
    console.log(' Gemini AI initialized successfully');
} catch (error) {
    console.error(' Failed to initialize Gemini AI:', error.message);
    process.exit(1);
}

// Store conversation histories (in production, use a database)
const conversations = new Map();

// Get Gemini model with enhanced configuration
function getModel() {
    try {
        return genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
                topP: 0.85,
                maxOutputTokens: 2000,
                candidateCount: 1,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH", 
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        });
    } catch (error) {
        console.error('Error creating model:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat endpoint with enhanced error handling
app.post('/api/chat', async (req, res) => {
    console.log('Received chat request:', req.body);
    
    try {
        const { message, sessionId } = req.body;
        
        // Validation
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required and must be a non-empty string' 
            });
        }

        if (!sessionId || typeof sessionId !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: 'Session ID is required' 
            });
        }

        // Get or create conversation history
        let conversationHistory = conversations.get(sessionId) || [];
        console.log(`📝 Session ${sessionId} has ${conversationHistory.length} previous messages`);
        
        // Create model instance
        const model = getModel();
        
        // Build enhanced context from conversation history
        let context = `You are a helpful, knowledgeable AI assistant powered by Google's Gemini 2.0 Flash model. 
        You provide accurate, helpful, and engaging responses to user questions. 
        You can help with a wide variety of topics including general knowledge, coding, writing, analysis, and creative tasks.
        Please be conversational, friendly, and provide detailed helpful responses.\n\n`;
        
        if (conversationHistory.length > 0) {
            context += "Previous conversation:\n";
            // Include last 10 exchanges to maintain context while managing token limits
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(item => {
                context += `Human: ${item.human}\nAssistant: ${item.ai}\n\n`;
            });
        }
        
        context += `Human: ${message.trim()}\nAssistant:`;
        
        console.log('🤖 Sending request to Gemini...');
        
        // Generate response with timeout
        const startTime = Date.now();
        const result = await Promise.race([
            model.generateContent(context),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
        ]);
        
        const endTime = Date.now();
        console.log(`⚡ Gemini response time: ${endTime - startTime}ms`);
        
        const response = result.response;
        const aiResponse = response.text();
        
        if (!aiResponse || aiResponse.trim().length === 0) {
            throw new Error('Empty response from Gemini');
        }
        
        console.log('✅ Got response from Gemini:', aiResponse.substring(0, 100) + '...');
        
        // Update conversation history
        conversationHistory.push({
            human: message.trim(),
            ai: aiResponse,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 25 exchanges to manage memory
        if (conversationHistory.length > 25) {
            conversationHistory = conversationHistory.slice(-25);
        }
        
        // Save updated history
        conversations.set(sessionId, conversationHistory);
        
        res.json({
            success: true,
            response: aiResponse,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in chat endpoint:', error);
        
        // Determine error type and provide appropriate response
        let errorMessage = 'I encountered an error while processing your request.';
        let statusCode = 500;
        
        if (error.message.includes('API key')) {
            errorMessage = 'API key configuration error. Please check the server configuration.';
            statusCode = 500;
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            errorMessage = 'API quota exceeded. Please try again later.';
            statusCode = 429;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
            statusCode = 504;
        } else if (error.message.includes('network') || error.message.includes('connect')) {
            errorMessage = 'Network connection error. Please check your internet connection.';
            statusCode = 503;
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Clear conversation history
app.post('/api/clear', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (sessionId && conversations.has(sessionId)) {
            conversations.delete(sessionId);
        }
        
        res.json({
            success: true,
            message: 'Conversation history cleared'
        });
        
    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear conversation'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server with enhanced logging
app.listen(PORT, () => {
    console.log('\n🚀 ===============================================');
    console.log('🤖 Gemini 2.0 Flash Chatbot Server Started!');
    console.log('===============================================');
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🌐 Open in browser: http://localhost:${PORT}`);
    console.log(`🔧 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    console.log('===============================================');
    console.log(`🔑 API Key Status: ${API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🎯 Model: gemini-2.0-flash-exp`);
    console.log(`💾 Memory: In-memory session storage`);
    console.log('===============================================\n');
    console.log('💡 How to use:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Start chatting with the AI!');
    console.log('   3. Use Ctrl+C to stop the server\n');
});

//AIzaSyBgBEE437JCVUjjo2fiNe1_P-Ht8CQuOdo
//"AIzaSyBYnQi_0ARDIrlIaGw--ETJ6MgpSQgUXDE";
