import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { config } from './config';
import { registerRoutes } from './api';
import { registerSocket } from './websocket';
import { toolRouter } from './core/toolRouter';
import { BrowserTool } from './tools/browser';
import { calculatorTool } from './tools/calculator';
import { memoryStoreTool, memoryRetrieveTool } from './tools/memory';
import { FilesystemTool } from './tools/filesystem';
import { TerminalTool } from './tools/terminal';
import { ClipboardTool } from './tools/clipboard';
import { NotificationTool } from './tools/notification';
import { Logger } from './utils/logger';
import { agentRuntime } from './agents/runtime';
import { persistence } from './agents/persistence';
import { transcribeAudio } from './services/stt';
import { synthesizeSpeech } from './services/tts';
import { startDigestJob } from './jobs/morningDigest';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Register Tools
toolRouter.registerTool(BrowserTool);
toolRouter.registerTool(calculatorTool);
toolRouter.registerTool(memoryStoreTool);
toolRouter.registerTool(memoryRetrieveTool);
toolRouter.registerTool(FilesystemTool);
toolRouter.registerTool(TerminalTool);
toolRouter.registerTool(ClipboardTool);
toolRouter.registerTool(NotificationTool);

// Initialize Routes and WebSockets
registerRoutes(app);
registerSocket(io);

// STT and TTS Endpoints
const upload = multer();
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    const transcript = await transcribeAudio(req.file.buffer);
    res.json({ transcript });
  } catch (err: any) {
    console.error('STT Error:', err);
    res.status(500).json({ error: err.message || 'STT failed' });
  }
});

app.post('/api/speak', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    const audioBuffer = await synthesizeSpeech(text, voiceId);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('TTS Error:', err);
    res.status(500).json({ error: err.message || 'TTS failed' });
  }
});

// Restore Agent Runtime state from disk (crash recovery / restart resilience)
const restoredAgents = persistence.restore();
if (restoredAgents.length > 0) {
  agentRuntime.restore(restoredAgents);
  Logger.info(`Workflow persistence: restored ${restoredAgents.length} agents.`);
}

// Start Scheduled Jobs
startDigestJob();

// Start Server
server.listen(config.port, () => {
  Logger.info(`VOCALIS OS Backend initialized on port ${config.port}`);
  Logger.info(`Health check: http://localhost:${config.port}/api/health`);
  Logger.info(`Agent API: http://localhost:${config.port}/api/agents`);
});

