import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { config } from './config';
import {
  isOmniVoiceAvailable,
  transcribeAudio as omniTranscribeAudio,
  synthesizeSpeech as omniSynthesizeSpeech,
  listVoices,
} from './services/omnivoice';
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
import { startMorningDigestJob } from './jobs/morningDigest';

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

app.get('/api/stt-available', (req, res) => {
  res.status(process.env.DEEPGRAM_API_KEY ? 200 : 404).json({ available: !!process.env.DEEPGRAM_API_KEY });
});

app.get('/api/tts-available', (req, res) => {
  res.status(process.env.ELEVENLABS_API_KEY ? 200 : 404).json({ available: !!process.env.ELEVENLABS_API_KEY });
});

const upload = multer();
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });
    const text = await transcribeAudio(req.file.buffer);
    res.json({ text });
  } catch (err: any) {
    console.error('STT Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/speak', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const audioBuffer = await synthesizeSpeech(text, voiceId);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err: any) {
    console.error('TTS Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const omniUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ── OmniVoice capability check ──────────────────────────────────────────────
app.get('/api/omnivoice/status', async (_req, res) => {
  const available = await isOmniVoiceAvailable();
  res.json({ available });
});

// ── OmniVoice STT ────────────────────────────────────────────────────────────
// Accepts: multipart/form-data with field 'audio' (webm blob)
// Returns: { transcript: string }
app.post('/api/omnivoice/transcribe', omniUpload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }
  try {
    const transcript = await omniTranscribeAudio(req.file.buffer, req.file.mimetype || 'audio/webm');
    res.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    res.status(500).json({ error: message });
  }
});

// ── OmniVoice TTS ────────────────────────────────────────────────────────────
// Accepts: { text: string, voice?: string }
// Returns: audio/mpeg stream
app.post('/api/omnivoice/speak', express.json(), async (req, res) => {
  const { text, voice } = req.body as { text?: string; voice?: string };
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const audioBuffer = await omniSynthesizeSpeech(text.trim(), voice || 'default');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS failed';
    res.status(500).json({ error: message });
  }
});

// ── OmniVoice voices list ────────────────────────────────────────────────────
app.get('/api/omnivoice/voices', async (_req, res) => {
  try {
    const voices = await listVoices();
    res.json({ voices });
  } catch {
    res.json({ voices: [] });
  }
});

// Restore Agent Runtime state from disk (crash recovery / restart resilience)
const restoredAgents = persistence.restore();
if (restoredAgents.length > 0) {
  agentRuntime.restore(restoredAgents);
  Logger.info(`Workflow persistence: restored ${restoredAgents.length} agents.`);
}

// Start Scheduled Jobs
startMorningDigestJob();

// Start Server
server.listen(config.port, () => {
  Logger.info(`VOCALIS OS Backend initialized on port ${config.port}`);
  Logger.info(`Health check: http://localhost:${config.port}/api/health`);
  Logger.info(`Agent API: http://localhost:${config.port}/api/agents`);
});

