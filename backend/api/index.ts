import { Express } from 'express';
import { chatRouter } from './chat';
import { ttsRouter } from './tts';
import { healthRouter } from './health';

export function registerRoutes(app: Express) {
  app.use('/api', chatRouter);
  app.use('/api', ttsRouter);
  app.use('/api', healthRouter);
}
