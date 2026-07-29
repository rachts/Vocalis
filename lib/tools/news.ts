import { ToolResult } from "../../types/tools";

export async function newsTool(): Promise<ToolResult> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const res = await fetch(\`\${apiUrl}/api/news\`);
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        spokenSummary: data.summary || "Here are the latest headlines."
      };
    }
  } catch (e) {
    console.error("News tool error", e);
  }
  return {
    success: false,
    data: null,
    spokenSummary: \`I couldn't fetch the news right now.\`
  };
}
