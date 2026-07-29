import type { ToolResult } from '@/types/tools';
const URL_MAP: Record<string, string> = {
  youtube: 'https://youtube.com',
  google: 'https://google.com',
  whatsapp: 'https://web.whatsapp.com',
  chatgpt: 'https://chat.openai.com',
  github: 'https://github.com',
  gmail: 'https://mail.google.com',
};
export async function navigationTool(args: { site?: string; url?: string }): Promise<ToolResult> {
  const url = args.url || (args.site && URL_MAP[args.site.toLowerCase()]);
  if (!url) return { success: false, data: null, spokenSummary: "I'm not sure which site to open." };
  return { success: true, data: { url }, spokenSummary: `Opening ${args.site || url} for you.` };
}
