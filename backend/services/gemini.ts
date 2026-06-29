import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import { toolRouter } from "../core/toolRouter";
import { Logger } from "../utils/logger";

export async function* streamChat(
  prompt: string,
  history: any[],
  imageBase64?: string
) {
  if (!config.apiKeys.gemini) {
    throw new Error("Missing Gemini API key");
  }

  const genAI = new GoogleGenerativeAI(config.apiKeys.gemini);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: toolRouter.getGeminiTools(),
  });

  const chat = model.startChat({
    history: history,
  });

  let promptPayload: any = prompt;
  if (imageBase64) {
    const base64Data = imageBase64.split(",")[1] || imageBase64;
    promptPayload = [
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ];
  }

  const result = await Logger.trackExecutionTime('Gemini_sendMessageStream', () => chat.sendMessageStream(promptPayload));
  let calledFunction = false;

  for await (const chunk of result.stream) {
    const call = chunk.functionCall();
    if (call) {
      calledFunction = true;
      yield { text: `[Executing Tool: ${call.name}] ` };

      // Dispatch execution to the central ToolRouter
      const executionResult = await toolRouter.execute(call.name, call.args);
      
      const functionResponse = {
        name: call.name,
        response: { content: executionResult },
      };

      const secondResult = await Logger.trackExecutionTime('Gemini_sendMessageStream_followup', () => chat.sendMessageStream([
        { functionResponse },
      ]));

      for await (const secondChunk of secondResult.stream) {
        const text = secondChunk.text();
        if (text) {
          yield { text };
        }
      }
    } else if (!calledFunction) {
      const text = chunk.text();
      if (text) {
        yield { text };
      }
    }
  }
}
