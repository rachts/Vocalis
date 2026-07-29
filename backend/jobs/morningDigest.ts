import cron from "node-cron";
import notifier from "node-notifier";
import { synthesizeSpeech } from "../services/tts";
// In a real application, you'd use the DigestAgent here
// import { DigestAgent } from "../../agents/digest";
// import { supabase } from "../../lib/memory";

export function startDigestJob() {
  // Runs every day at 7:30 AM local time
  cron.schedule("30 7 * * *", async () => {
    try {
      console.log("Running morning digest...");
      // Mocking the agent run for simplicity since backend doesn't easily import frontend/Next.js code without a build step
      const briefingResponse = "Good morning! It's currently 72 degrees and sunny. You have 3 tasks for today, including reviewing pull requests. Your first meeting is at 10 AM.";
      
      const audioBuffer = await synthesizeSpeech(briefingResponse);
      
      // We would normally store this in Supabase Storage here and update the "digests" table
      // e.g. await supabase.from("digests").upsert({ id: "latest", text: briefingResponse, ... })
      
      notifier.notify({ title: "Vocalis", message: "Your morning digest is ready" });
      console.log("Morning digest complete.");
    } catch (e) {
      console.error("Morning digest failed", e);
    }
  });
}
