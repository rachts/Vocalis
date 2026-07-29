import { ToolResult } from "../../types/tools";

export async function navigationTool(args: Record<string, unknown>): Promise<ToolResult> {
  let url = args.url as string;
  if (!url.startsWith("http")) {
    if (url.toLowerCase().includes("youtube")) {
      url = "https://youtube.com";
    } else if (url.toLowerCase().includes("news")) {
      url = "https://news.google.com";
    } else {
      url = \`https://\${url}\`;
    }
  }
  
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
  
  return {
    success: true,
    data: { url },
    spokenSummary: \`Opening \${args.url} for you.\`
  };
}
