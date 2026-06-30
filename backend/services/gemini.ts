import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { config } from "../config";
import { toolRouter } from "../core/toolRouter";
import { Logger } from "../utils/logger";
import { ExecutionPlan } from "../engine/task";

function getGenAI() {
  if (!config.apiKeys.gemini) {
    throw new Error("Missing Gemini API key");
  }
  return new GoogleGenerativeAI(config.apiKeys.gemini);
}

/**
 * 1. Generates a structured execution plan.
 */
export async function generatePlan(goal: string, history: any[]): Promise<ExecutionPlan> {
  const genAI = getGenAI();
  
  // Create a JSON schema that forces the model to return an ExecutionPlan format
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      steps: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING, description: "Unique ID for this step (e.g., 'step1')" },
            toolName: { type: SchemaType.STRING, description: "Name of the tool to execute" },
            args: { type: SchemaType.OBJECT, properties: {}, description: "Arguments for the tool" },
            description: { type: SchemaType.STRING, description: "Short human-readable description of what this step does" }
          },
          required: ["id", "toolName", "args", "description"]
        }
      },
      requiresFinalResponse: {
        type: SchemaType.BOOLEAN,
        description: "True if the assistant should provide a final conversational response to the user after execution."
      }
    },
    required: ["steps", "requiresFinalResponse"]
  } as any;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: toolRouter.getGeminiTools(),
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2
    }
  });

  const chat = model.startChat({ history });
  
  const prompt = `You are a Planner. Given the user's goal, determine the execution plan using the available tools. Goal: ${goal}`;
  const result = await Logger.trackExecutionTime('Gemini_generatePlan', () => chat.sendMessage(prompt));
  
  const text = result.response.text();
  try {
    return JSON.parse(text) as ExecutionPlan;
  } catch (e) {
    Logger.error("Failed to parse ExecutionPlan", e);
    return { steps: [], requiresFinalResponse: true };
  }
}

/**
 * 2. Generates the final synthesized response based on tool outputs.
 */
export async function* generateFinalResponse(
  goal: string, 
  history: any[], 
  toolOutputs: Record<string, any>,
  imageBase64?: string
) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const chat = model.startChat({ history });

  let promptPayload: any = `User Goal: ${goal}\n\nTool Execution Outputs:\n${JSON.stringify(toolOutputs, null, 2)}\n\nPlease provide the final response to the user based on these results.`;
  
  if (imageBase64) {
    const base64Data = imageBase64.split(",")[1] || imageBase64;
    promptPayload = [
      promptPayload,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ];
  }

  const result = await Logger.trackExecutionTime('Gemini_finalResponseStream', () => chat.sendMessageStream(promptPayload));

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield { text };
    }
  }
}
