import { AgentTask, AgentResult } from './types';
import { SharedAgentContext } from './shared-context';
import { generateFinalResponse } from '../services/gemini';
import { Logger } from '../utils/logger';
import { ttsService } from '../services/tts.service';

/**
 * ConversationAgent — Owns all natural language synthesis and streaming.
 * Keeps conversational logic completely separate from execution logic.
 */
export class ConversationAgent {
  static async run(task: AgentTask, context: SharedAgentContext): Promise<AgentResult> {
    const { goal, toolOutputs } = task.payload;
    Logger.info(`[ConversationAgent] Synthesizing response for: "${goal?.substring(0, 60)}"`);

    context.emitStreamEvent('stage_change', { stage: 'generating_response' });

    try {
      const history = context.session.getGeminiHistory();
      const stream = generateFinalResponse(goal, history, toolOutputs || {});

      context.emitStreamEvent('stage_change', { stage: 'speaking' });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          context.emitStreamEvent('text_stream', { text: chunk.text });
        }
      }

      // Persist the AI turn in conversation history
      context.session.addMessage('model', fullResponse);

      Logger.info(`[ConversationAgent] Response synthesized (${fullResponse.length} chars).`);

      try {
        Logger.info(`[ConversationAgent] Starting TTS generation...`);
        const audioStream = await ttsService.generateSpeech(fullResponse);
        
        audioStream.on('data', (chunk: Buffer) => {
          // Broadcast audio chunks
          import('../events/bus').then(({ eventBus, SystemEvents }) => {
            eventBus.emit(SystemEvents.TTSAudioChunk, chunk);
          });
        });
        
        audioStream.on('end', () => {
          import('../events/bus').then(({ eventBus, SystemEvents }) => {
            eventBus.emit(SystemEvents.TTSAudioEnd);
          });
        });

        audioStream.on('error', (err) => {
          Logger.error(`[ConversationAgent] TTS Stream Error`, err);
          import('../events/bus').then(({ eventBus, SystemEvents }) => {
            eventBus.emit(SystemEvents.TTSAudioEnd);
          });
        });
      } catch (ttsErr: any) {
        Logger.error(`[ConversationAgent] TTS generation failed`, ttsErr);
        import('../events/bus').then(({ eventBus, SystemEvents }) => {
          eventBus.emit(SystemEvents.TTSAudioEnd);
        });
      }

      return { success: true, data: { response: fullResponse } };
    } catch (err: any) {
      Logger.error(`[ConversationAgent] Failed`, err);
      return { success: false, data: null, error: err.message };
    }
  }
}
