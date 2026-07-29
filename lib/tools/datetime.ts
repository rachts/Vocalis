import { ToolResult } from "../../types/tools";
import { format } from "date-fns";

export async function datetimeTool(): Promise<ToolResult> {
  const now = new Date();
  const time = format(now, "h:mm a");
  const date = format(now, "EEEE, MMMM do");
  
  return {
    success: true,
    data: { time, date },
    spokenSummary: \`It's currently \${time} on \${date}.\`
  };
}
