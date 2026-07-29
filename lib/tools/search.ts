import { ToolResult } from "../../types/tools";

export async function searchTool(args: Record<string, unknown>): Promise<ToolResult> {
  const query = args.query as string;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const res = await fetch(\`\${apiUrl}/api/search\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        spokenSummary: data.summary || \`I found some results for \${query}.\`
      };
    }
  } catch (e) {
    console.error("Search tool error", e);
  }
  return {
    success: false,
    data: null,
    spokenSummary: \`I encountered an error searching for \${query}.\`
  };
}
