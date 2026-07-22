import { Router } from 'express';
import { generateFinalResponse } from '../services/gemini';
import fs from 'fs';
import { getOrCreateSession } from '../core/conversation';
import { IntentRouter, IntentCategory } from '../core/intentRouter';
import { toolRouter } from '../core/toolRouter';
import { Logger } from '../utils/logger';
import { ttsService } from '../services/tts.service';
import { eventBus, SystemEvents } from '../events/bus';
import { createAssistantContext } from '../engine/context';
import { Task } from '../engine/task';
import { Planner } from '../engine/planner';
import { ExecutionEngine } from '../engine/executor';
import { agentRuntime } from '../agents/runtime';
import { createSharedContext } from '../agents/shared-context';
import { createAgentTask } from '../agents/types';

export const chatRouter = Router();

chatRouter.post('/chat', async (req, res) => {
  try {
    const { history, imageBase64, sessionId, useAgents } = req.body;
    const prompt = req.body.prompt || req.body.command || req.body.text || '';
    
    const session = getOrCreateSession(sessionId || 'default-session');
    const activeHistory = history || session.getGeminiHistory();
    session.addMessage('user', prompt);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const emitStreamEvent = (event: string, payload: any) => {
      res.write(`data: ${JSON.stringify({ event, payload })}\n\n`);
    };

    // 1. Check Intent
    const intentResult = IntentRouter.analyze(prompt);
    session.lastIntent = intentResult.category;

    // Fast path: direct single-tool execution (no planning needed)
    if (intentResult.category !== IntentCategory.CONVERSATION && intentResult.directTool) {
      emitStreamEvent('stage_change', { stage: 'executing' });
      emitStreamEvent('tool_start', { toolName: intentResult.directTool, args: intentResult.directArgs });
      const result = await toolRouter.execute(intentResult.directTool, intentResult.directArgs);
      emitStreamEvent('tool_end', { toolName: intentResult.directTool, result });
      emitStreamEvent('text_stream', { text: result });
      session.addMessage('model', result);
      
      try {
        Logger.info(`Calling TTS (Fast Path) for response: "${result.substring(0, 30)}..."`);
        const audioStream = await ttsService.generateSpeech(result);
        audioStream.on('data', (chunk) => {
          Logger.info('Sending audio chunk (Fast Path)');
          eventBus.emit(SystemEvents.TTSAudioChunk, chunk);
        });
        audioStream.on('end', () => {
          Logger.info('TTS audio stream ended (Fast Path)');
          eventBus.emit(SystemEvents.TTSAudioEnd);
        });
        audioStream.on('error', (err) => {
           Logger.error('TTS Fast Path error stream level', err);
           eventBus.emit(SystemEvents.TTSAudioEnd);
        });
      } catch (e) {
        Logger.error('TTS Fast Path error catching generateSpeech', e);
        eventBus.emit(SystemEvents.TTSAudioEnd);
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // ── AGENT PATH: use multi-agent runtime for complex goals ──────────────────
    if (useAgents) {
      const context = createSharedContext(session, 'default-user', emitStreamEvent);
      const task = createAgentTask('PLAN', prompt, { userGoal: prompt, imageBase64 });

      // Run planner synchronously (we hold the SSE connection open)
      await agentRuntime.dispatchSync('planner', task, context);

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // ── CLASSIC PATH: Planner + ExecutionEngine (unchanged for fast/simple tasks) ──
    emitStreamEvent('stage_change', { stage: 'planning' });
    const legacyContext = createAssistantContext(session, 'default-user');
    const legacyTask = new Task(prompt);
    await Planner.createPlan(legacyTask, legacyContext);
    if (legacyTask.plan) {
      emitStreamEvent('plan_created', { plan: legacyTask.plan });
    }

    emitStreamEvent('stage_change', { stage: 'executing' });
    const toolOutputs = await ExecutionEngine.execute(legacyTask, legacyContext, emitStreamEvent);

    if (!legacyTask.plan || legacyTask.plan.requiresFinalResponse) {
      emitStreamEvent('stage_change', { stage: 'synthesizing' });
      const stream = generateFinalResponse(prompt, activeHistory, toolOutputs, imageBase64);
      
      emitStreamEvent('stage_change', { stage: 'speaking' });
      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          emitStreamEvent('text_stream', { text: chunk.text });
        }
      }
      session.addMessage('model', fullResponse);
      
      try {
        Logger.info(`Calling TTS (Legacy Path) for response: "${fullResponse.substring(0, 30)}..."`);
        const audioStream = await ttsService.generateSpeech(fullResponse);
        audioStream.on('data', (chunk) => {
          Logger.info('Sending audio chunk (Legacy Path)');
          eventBus.emit(SystemEvents.TTSAudioChunk, chunk);
        });
        audioStream.on('end', () => {
          Logger.info('TTS audio stream ended (Legacy Path)');
          eventBus.emit(SystemEvents.TTSAudioEnd);
        });
        audioStream.on('error', (err) => {
           Logger.error('TTS Legacy Path error stream level', err);
           eventBus.emit(SystemEvents.TTSAudioEnd);
        });
      } catch (e) {
        Logger.error('TTS Legacy Path error catching generateSpeech', e);
        eventBus.emit(SystemEvents.TTSAudioEnd);
      }
    } else {
      const text = '\nTask completed successfully.';
      emitStreamEvent('text_stream', { text });
      session.addMessage('model', text);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    Logger.error('Chat API error:', error);
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Chat API error: ${error.message}\n${error.stack}\n`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process request' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.end();
    }
  }
});
