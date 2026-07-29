import { ToolResult } from "../../types/tools";

export async function digestTool(): Promise<ToolResult> {
  try {
    // Could trigger a backend route that compiles the digest, or we can just trigger it directly here
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const res = await fetch(\`\${apiUrl}/api/digest\`);
    
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        spokenSummary: "I've generated your morning digest."
      };
    }
  } catch (e) {
    console.error("Digest tool error", e);
  }
  
  return {
    success: false,
    data: null,
    spokenSummary: \`I couldn't generate the morning digest right now.\`
  };
}
