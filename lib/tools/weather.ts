import type { ToolResult } from '@/types/tools';
export async function weatherTool(args: { location?: string }): Promise<ToolResult> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const loc = args.location || 'current location';
    const res = await fetch(`${backendUrl}/api/weather?location=${encodeURIComponent(loc)}`);
    const data = await res.json();
    const summary = data.description
      ? `It's ${data.temperature}°C and ${data.description} in ${data.location}.`
      : 'Weather information is unavailable right now.';
    return { success: true, data, spokenSummary: summary };
  } catch {
    return { success: false, data: null, spokenSummary: "I couldn't fetch the weather right now." };
  }
}
