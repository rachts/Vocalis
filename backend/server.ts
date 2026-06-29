import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { registerRoutes } from './api';
import { registerSocket } from './websocket';
import { toolRouter } from './core/toolRouter';
import { browserTool } from './tools/browser';
import { calculatorTool } from './tools/calculator';
import { memoryStoreTool, memoryRetrieveTool } from './tools/memory';
import { Logger } from './utils/logger';

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
toolRouter.registerTool(browserTool);
toolRouter.registerTool(calculatorTool);
toolRouter.registerTool(memoryStoreTool);
toolRouter.registerTool(memoryRetrieveTool);

// Initialize Routes and WebSockets
registerRoutes(app);
registerSocket(io);

// Start Server
server.listen(config.port, () => {
  Logger.info(`VOCALIS OS Backend initialized on port ${config.port}`);
  Logger.info(`Health check: http://localhost:${config.port}/api/health`);
});

