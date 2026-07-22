import { IntentRouter } from '../backend/core/intentRouter';
import { generatePlan, generateFinalResponse } from '../backend/services/gemini';
import { Logger } from '../backend/utils/logger';

async function testBackendPipeline() {
  console.log("==========================================");
  console.log("[TEST PIPELINE] Starting Live System Audit");
  console.log("==========================================");

  const testCommand = "Tell me a 1-sentence joke about computers";
  console.log(`[TEST STEP 1] Received Command: "${testCommand}"`);

  // 1. Intent Routing
  const intent = IntentRouter.analyze(testCommand);
  console.log(`[TEST STEP 2] Intent Router Output:`, intent);

  // 2. Gemini Planner Execution
  console.log("[TEST STEP 3] Calling Gemini Planner...");
  try {
    const plan = await generatePlan(testCommand, []);
    console.log("[TEST STEP 4] [GEMINI PLANNER SUCCESS] Plan generated:", JSON.stringify(plan, null, 2));

    // 3. Gemini Final Response Synthesis Stream
    console.log("[TEST STEP 5] Generating Final Streamed Response from Gemini...");
    const responseStream = generateFinalResponse(testCommand, [], {});
    let fullResponse = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullResponse += chunk.text;
      }
    }
    console.log(`[TEST STEP 6] [GEMINI RESPONSE RECEIVED] "${fullResponse}"`);

  } catch (err: any) {
    console.error("[TEST ERROR] Pipeline stage failed:", err.message);
  }

  console.log("==========================================");
  console.log("[TEST PIPELINE] Verification Complete");
  console.log("==========================================");
}

testBackendPipeline();
