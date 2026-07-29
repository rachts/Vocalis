import { ToolResult } from "../../types/tools";

export async function weatherTool(args: Record<string, unknown>): Promise<ToolResult> {
  const location = args.location as string || "your location";
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const res = await fetch(\`\${apiUrl}/api/weather?location=\${encodeURIComponent(location)}\`);
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        spokenSummary: \`The weather in \${location} is \${data.description} with a temperature of \${data.temperature}.\`
      };
    }
  } catch (e) {
    console.error("Weather tool error", e);
  }
  return {
    success: false,
    data: null,
    spokenSummary: \`I couldn't fetch the weather for \${location} right now.\`
  };
}
