import { ITool } from '../base';
import { SchemaType } from '@google/generative-ai';
import puppeteer, { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;
let activePage: Page | null = null;

export const BrowserTool: ITool = {
  name: 'browser',
  description: 'Automate a headless web browser. Actions: "open" (opens url), "click" (clicks selector), "type" (types text in selector), "screenshot" (returns base64), "extract" (returns text content of selector or body).',
  requiresPermission: false, // Could require permission if needed
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: {
        type: SchemaType.STRING,
        description: 'Action to perform: "open", "click", "type", "screenshot", "extract"',
      },
      url: {
        type: SchemaType.STRING,
        description: 'URL for "open" action',
      },
      selector: {
        type: SchemaType.STRING,
        description: 'CSS Selector for "click", "type", or "extract"',
      },
      text: {
        type: SchemaType.STRING,
        description: 'Text for "type" action',
      }
    },
    required: ['action']
  },
  execute: async (args: any) => {
    try {
      if (!browserInstance) {
        browserInstance = await puppeteer.launch({ headless: true });
      }
      if (!activePage) {
        activePage = await browserInstance.newPage();
      }

      switch (args.action) {
        case 'open':
          if (!args.url) return { success: false, error: 'url required' };
          await activePage.goto(args.url, { waitUntil: 'networkidle2' });
          return { success: true, message: `Opened ${args.url}` };
          
        case 'click':
          if (!args.selector) return { success: false, error: 'selector required' };
          await activePage.click(args.selector);
          return { success: true, message: `Clicked ${args.selector}` };
          
        case 'type':
          if (!args.selector || !args.text) return { success: false, error: 'selector and text required' };
          await activePage.type(args.selector, args.text);
          return { success: true, message: `Typed in ${args.selector}` };
          
        case 'screenshot':
          const buffer = await activePage.screenshot({ encoding: 'base64' });
          return { success: true, base64: buffer };
          
        case 'extract':
          if (args.selector) {
            const content = await activePage.$eval(args.selector, (el: any) => el.textContent);
            return { success: true, content };
          } else {
            const content = await activePage.evaluate(() => document.body.innerText);
            return { success: true, content };
          }
          
        default:
          return { success: false, error: 'Invalid browser action' };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
