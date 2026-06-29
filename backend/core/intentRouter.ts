import { Logger } from '../utils/logger';

export enum IntentCategory {
  CONVERSATION = 'CONVERSATION',
  SEARCH = 'SEARCH',
  CALCULATOR = 'CALCULATOR',
  MEMORY = 'MEMORY'
}

export interface IntentResult {
  category: IntentCategory;
  directTool?: string;
  directArgs?: any;
}

export class IntentRouter {
  
  /**
   * Extremely simple heuristic-based intent router for Phase 2.
   * In a future update, this could use a small local LLM or NLP classifier.
   */
  static analyze(prompt: string): IntentResult {
    const text = prompt.toLowerCase().trim();
    
    // Calculator heuristic
    if (text.match(/^what is \d+[\+\-\*\/]\d+$/) || text.match(/calculate \d+[\+\-\*\/]\d+/)) {
      const match = text.match(/(\d+\s*[\+\-\*\/]\s*\d+)/);
      if (match) {
        Logger.info('IntentRouter: Routed directly to CALCULATOR');
        return {
          category: IntentCategory.CALCULATOR,
          directTool: 'calculate',
          directArgs: { expression: match[1] }
        };
      }
    }

    // Default to conversational flow (hits Gemini)
    Logger.info('IntentRouter: Routed to CONVERSATION (Gemini)');
    return {
      category: IntentCategory.CONVERSATION
    };
  }
}
