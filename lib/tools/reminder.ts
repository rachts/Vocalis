import { ToolResult } from "../../types/tools";
import { getClient } from "../memory";
import { format } from "date-fns";

export async function reminderTool(args: Record<string, unknown>): Promise<ToolResult> {
  const task = args.task as string;
  const timeStr = args.time as string;
  
  try {
    // Basic parsing of time assuming it's ISO or parseable by Date
    const fireAt = new Date(timeStr);
    
    // Save to Supabase
    const supabase = await getClient();
    if (supabase) {
      await supabase.from("todos").insert({
        task,
        time: fireAt.toISOString(),
        completed: false
      });
    }
    
    return {
      success: true,
      data: { task, timeStr },
      spokenSummary: `I've set a reminder to ${task} at ${format(fireAt, "h:mm a")}.`
    };
  } catch (e) {
    console.error("Reminder tool error", e);
    return {
      success: false,
      data: null,
      spokenSummary: `I couldn't set that reminder for you.`
    };
  }
}
