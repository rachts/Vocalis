import { Router } from 'express';
import { streamChat } from '../services/gemini';
import fs from 'fs';
import { getOrCreateSession } from '../core/conversation';
import { IntentRouter, IntentCategory } from '../core/intentRouter';
import { toolRouter } from '../core/toolRouter';
import { Logger } from '../utils/logger';

export const chatRouter = Router();

chatRouter.post('/chat', async (req, res) => {
  try {
    const { prompt, history, imageBase64, sessionId } = req.body;
    
    // For Phase 2, we simulate a default session if one isn't passed from the client
    const session = getOrCreateSession(sessionId || 'default-session');
    
    // The history from client might be merged with backend history in the future,
    // for now we trust the client history for simplicity if provided, otherwise fallback to session.
    const activeHistory = history || session.getGeminiHistory();

    session.addMessage('user', prompt);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 1. Check Intent
    const intentResult = IntentRouter.analyze(prompt);
    session.lastIntent = intentResult.category;

    if (intentResult.category !== IntentCategory.CONVERSATION && intentResult.directTool) {
      // Bypass Gemini completely for deterministic tools
      res.write(`data: ${JSON.stringify({ text: `[Executing Direct Tool: ${intentResult.directTool}] ` })}\n\n`);
      
      const result = await toolRouter.execute(intentResult.directTool, intentResult.directArgs);
      
      res.write(`data: ${JSON.stringify({ text: result })}\n\n`);
      session.addMessage('model', result);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // 2. Fallback to Gemini
    const stream = streamChat(prompt, activeHistory, imageBase64);
    
    let fullResponse = '';
    for await (const chunk of stream) {
      if (chunk.text) {
        fullResponse += chunk.text;
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    session.addMessage('model', fullResponse);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    Logger.error("Chat API error:", error);
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Chat API error: ${error.message}\n${error.stack}\n`);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate AI response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});
