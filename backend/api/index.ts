import { Express } from 'express';
import { chatRouter } from './chat';
import { ttsRouter } from './tts';
import { healthRouter } from './health';
import { jobsRouter } from './jobs';
import { agentsRouter } from './agents';
import { memoryRouter } from './memory';

export function registerRoutes(app: Express) {
  app.use('/api', chatRouter);
  app.use('/api', ttsRouter);
  app.use('/api', healthRouter);
  app.use('/api', jobsRouter);
  app.use('/api', agentsRouter);
  app.use('/api', memoryRouter);
}
