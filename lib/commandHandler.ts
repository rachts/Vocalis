import { geminiFlash } from './llm';
import { buildSystemPrompt } from './prompts';
import { TOOL_DEFINITIONS, executeTool } from './tools';
import { getMemory, saveMemory } from './memory';
import type { AgentResponse, AgentContext } from '@/types/agents';
import type { ToolCall } from '@/types/tools';

export async function processCommand(context: AgentContext): Promise<AgentResponse> {
  try {
    const chat = geminiFlash.startChat({
      systemInstruction: buildSystemPrompt(),
      history: context.history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      tools: [{ functionDeclarations: TOOL_DEFINITIONS as any }],
    });

    let result = await chat.sendMessage(context.transcript);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      const toolResult = await executeTool({ name: call.name as any, args: call.args as any });
      result = await chat.sendMessage([{
        functionResponse: { name: call.name, response: toolResult.data as Record<string, unknown> }
      }]);
      
      await saveMemory(context.sessionId, 'user', context.transcript);
      await saveMemory(context.sessionId, 'assistant', toolResult.spokenSummary);

      return {
        response: toolResult.spokenSummary,
        action: call.name === 'open_url' 
          ? { type: 'open_url', payload: (toolResult.data as any).url }
          : undefined
      };
    }

    const text = result.response.text();
    await saveMemory(context.sessionId, 'user', context.transcript);
    await saveMemory(context.sessionId, 'assistant', text);
    
    return { response: text };

  } catch (error) {
    console.error('Command processing error:', error);
    return { response: "I'm having trouble processing that right now." };
  }
}
