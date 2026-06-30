import { Router, Request, Response } from 'express';
import { memoryStore } from '../memory';

export const memoryRouter = Router();

// Inject mock memories for testing the UI
memoryStore.store('User Preference: Dark Mode', 'Learned that the user prefers high-contrast dark themes for long reading sessions, specifically requesting obsidian backgrounds.');
memoryStore.store('Project Synthesis.pdf', 'Extracted key requirements for the Q3 pipeline update. Emphasis on real-time processing and reduced latency in the data ingestion layer.');
memoryStore.store('Meeting with Sarah', 'Discussed the timeline for the beta release. She emphasized the need for better error handling in the UI.');
memoryStore.store('Auth Module Refactor', 'Implemented JWT token rotation and integrated the new OAuth providers.');

/**
 * GET /api/memory
 * Retrieves all stored memories and enriches them with UI-friendly metadata 
 * since the underlying InMemoryStore only uses key/value pairs for now.
 */
memoryRouter.get('/memory', async (req: Request, res: Response) => {
  try {
    const rawMemories = await memoryStore.getAll();
    
    // Process and enrich each memory with fallback metadata for the UI
    const formattedMemories = Object.keys(rawMemories).map((key) => {
      const value = rawMemories[key];
      
      // Determine type based on some heuristic or fallback to KNOWLEDGE
      let type = 'KNOWLEDGE';
      if (key.toLowerCase().includes('code') || key.toLowerCase().includes('function')) {
        type = 'CODE';
      } else if (key.toLowerCase().includes('person') || key.toLowerCase().includes('user')) {
        type = 'PEOPLE';
      }

      return {
        id: key,
        title: key,
        content: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
        category: type,
        timestamp: new Date().toISOString(), // Fallback
        source: 'System',
      };
    });

    res.json({ memories: formattedMemories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
