import type { ToolResult } from '@/types/tools';
export async function searchTool(args: { query: string }): Promise<ToolResult> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${backendUrl}/api/search?q=${encodeURIComponent(args.query)}`);
    const data = await res.json();
    const summary = data.results?.[0]
      ? `Here's what I found: ${data.results[0].title}. ${data.results[0].snippet}`
      : `I searched for "${args.query}" but found no results.`;
    return { success: true, data, spokenSummary: summary };
  } catch {
    return { success: false, data: null, spokenSummary: "Search is unavailable right now." };
  }
}
