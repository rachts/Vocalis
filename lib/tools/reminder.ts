import { ToolResult } from "../../types/tools";
import { supabase } from "../memory";
import { format } from "date-fns";

export async function reminderTool(args: Record<string, unknown>): Promise<ToolResult> {
  const task = args.task as string;
  const timeStr = args.time as string;
  
  try {
    // Basic parsing of time assuming it's ISO or parseable by Date
    const fireAt = new Date(timeStr);
    
    if (supabase) {
      await supabase.from("reminders").insert({ text: task, fire_at: fireAt.toISOString() });
    }
    
    return {
      success: true,
      data: { task, timeStr },
      spokenSummary: \`I've set a reminder to \${task} at \${format(fireAt, "h:mm a")}.\`
    };
  } catch (e) {
    console.error("Reminder tool error", e);
    return {
      success: false,
      data: null,
      spokenSummary: \`I couldn't set that reminder for you.\`
    };
  }
}
