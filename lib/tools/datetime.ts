import type { ToolResult } from '@/types/tools';
export async function datetimeTool(): Promise<ToolResult> {
  const now = new Date();
  const formatted = now.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  return { success: true, data: formatted, spokenSummary: `It's ${formatted}.` };
}
