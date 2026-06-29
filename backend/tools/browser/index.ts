import puppeteer from 'puppeteer';
import { SchemaType } from '@google/generative-ai';
import { ITool } from '../base';
import { Logger } from '../../utils/logger';

export const browserTool: ITool = {
  name: "searchWebAndSummarize",
  description: "Searches the web for up-to-date information, news, or facts and returns a summary of the top results. Use this when the user asks about current events or something you do not know.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: "The search query to execute",
      },
    },
    required: ["query"],
  },
  requiresPermission: false,
  execute: async (args: { query: string }) => {
    let browser = null;
    try {
      Logger.info(`BrowserAgent: Searching for "${args.query}"`);
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(args.query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      const results = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('.result__snippet')).slice(0, 3);
        return nodes.map((el, i) => `Result ${i+1}: ${el.textContent?.trim()}`).join('\n\n');
      });

      return results || "No reliable search results found.";
    } catch (err: any) {
      Logger.error("Browser Agent Error:", err);
      return `Error executing web search: ${err.message}`;
    } finally {
      if (browser) await browser.close();
    }
  }
};
