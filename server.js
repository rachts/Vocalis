const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const sampleData = [
  { id: 1, title: "Getting Started with Vocalis", content: "Vocalis is your personal AI voice assistant. Created by Rachit." },
  { id: 2, title: "Voice Commands", content: "You can ask about time, weather, add todos, and set reminders." },
  { id: 3, title: "Search Functionality", content: "Use the search bar to find information quickly and efficiently." },
  { id: 4, title: "Weather Updates", content: "Get real-time weather information for your location." },
  { id: 5, title: "Todo Management", content: "Add, view, and manage your daily tasks with ease." },
]

app.get("/api/search", (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || ""
    
    if (!query) {
      return res.json([])
    }
    
    const results = sampleData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    )
    
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: "An error occurred during search" })
  }
})

app.get("/api/weather", (req, res) => {
  res.json({
    temperature: 27,
    location: "Gonin Gora, Kad",
    condition: "Sunny",
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Vocalis",
    version: "1.0.0",
    createdBy: "Rachit",
    time: new Date().toISOString()
  })
})

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { searchWebAndSummarize } = require('./backend/agents/browserAgent');

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing Gemini API key" });
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const tools = [
      {
        functionDeclarations: [
          {
            name: "searchWebAndSummarize",
            description: "Searches the web for up-to-date information, news, or facts and returns a summary of the top results. Use this when the user asks about current events or something you do not know.",
            parameters: {
              type: "OBJECT",
              properties: {
                query: {
                  type: "STRING",
                  description: "The search query to execute"
                }
              },
              required: ["query"]
            }
          }
        ]
      }
    ];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      tools: tools
    });
    
    const prompt = req.body.prompt;
    const history = req.body.history || [];
    const imageBase64 = req.body.imageBase64;
    
    const chat = model.startChat({
      history: history
    });
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let promptPayload = prompt;
    if (imageBase64) {
      // Extract base64 payload (strip data:image/jpeg;base64,)
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      promptPayload = [
        prompt, 
        { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
      ];
    }

    const result = await chat.sendMessageStream(promptPayload);
    let calledFunction = false;
    
    for await (const chunk of result.stream) {
      const call = chunk.functionCall();
      if (call) {
        calledFunction = true;
        if (call.name === "searchWebAndSummarize") {
          // Stream an interim status back to client
          res.write(`data: ${JSON.stringify({ text: "Searching the web... " })}\n\n`);
          
          const searchResult = await searchWebAndSummarize(call.args.query);
          
          const secondResult = await chat.sendMessageStream([{
            functionResponse: {
              name: "searchWebAndSummarize",
              response: { content: searchResult }
            }
          }]);
          
          for await (const secondChunk of secondResult.stream) {
            const text = secondChunk.text();
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }
        }
      } else if (!calledFunction) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Gemini error:", error);
    require('fs').appendFileSync('debug.log', `[${new Date().toISOString()}] Gemini error: ${error.message}\n${error.stack}\n`);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate AI response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing ElevenLabs API key" });

    const text = req.body.text;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel default
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Failed to generate TTS" });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  let deepgramLive = null;

  socket.on('start-stt', () => {
    if (deepgramLive) return;

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      socket.emit('stt-error', 'Deepgram API key missing');
      return;
    }

    const dgUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&interim_results=true';
    
    deepgramLive = new WebSocket(dgUrl, {
      headers: {
        Authorization: `Token ${apiKey}`
      }
    });

    deepgramLive.on('open', () => {
      console.log('Deepgram connection opened');
      socket.emit('stt-ready');
    });

    deepgramLive.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        if (response.channel && response.channel.alternatives && response.channel.alternatives.length > 0) {
          const transcript = response.channel.alternatives[0].transcript;
          const isFinal = response.is_final;
          if (transcript) {
            socket.emit('transcript', { text: transcript, isFinal });
          }
        }
      } catch (e) {
        console.error('Error parsing Deepgram message', e);
      }
    });

    deepgramLive.on('close', () => {
      console.log('Deepgram connection closed');
      deepgramLive = null;
    });

    deepgramLive.on('error', (err) => {
      console.error('Deepgram error:', err);
      socket.emit('stt-error', 'Deepgram connection error');
    });
  });

  socket.on('audio-data', (data) => {
    if (deepgramLive && deepgramLive.readyState === WebSocket.OPEN) {
      deepgramLive.send(data);
    }
  });

  socket.on('stop-stt', () => {
    if (deepgramLive) {
      deepgramLive.close();
      deepgramLive = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (deepgramLive) {
      deepgramLive.close();
      deepgramLive = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Vocalis API server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
