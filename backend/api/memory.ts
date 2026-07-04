import { Router, Request, Response } from 'express';
import { memoryStore } from '../memory';

export const memoryRouter = Router();

// Inject mock memories for testing the UI
memoryStore.store({
  id: 'User Preference: Dark Mode',
  title: 'User Preference: Dark Mode',
  content: 'Learned that the user prefers high-contrast dark themes for long reading sessions, specifically requesting obsidian backgrounds.',
  category: 'PEOPLE',
  importanceScore: 85,
});
memoryStore.store({
  id: 'Project Synthesis.pdf',
  title: 'Project Synthesis.pdf',
  content: 'Extracted key requirements for the Q3 pipeline update. Emphasis on real-time processing and reduced latency in the data ingestion layer.',
  category: 'KNOWLEDGE',
  importanceScore: 92,
});
memoryStore.store({
  id: 'Meeting with Sarah',
  title: 'Meeting with Sarah',
  content: 'Discussed the timeline for the beta release. She emphasized the need for better error handling in the UI.',
  category: 'CONVERSATION',
  importanceScore: 60,
});
memoryStore.store({
  id: 'Auth Module Refactor',
  title: 'Auth Module Refactor',
  content: 'Implemented JWT token rotation and integrated the new OAuth providers.',
  category: 'CODE',
  importanceScore: 75,
});

/**
 * GET /api/memory
 * Retrieves all stored memories
 */
memoryRouter.get('/memory', async (req: Request, res: Response) => {
  try {
    const rawMemories = await memoryStore.getAll();
    res.json({ memories: rawMemories });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/memory
 * Create a new memory
 */
memoryRouter.post('/memory', async (req: Request, res: Response) => {
  try {
    const newMemory = await memoryStore.store(req.body);
    res.json(newMemory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/memory/:id
 * Update an existing memory
 */
memoryRouter.put('/memory/:id', async (req: Request, res: Response) => {
  try {
    const updated = await memoryStore.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a memory
 */
memoryRouter.delete('/memory/:id', async (req: Request, res: Response) => {
  try {
    const success = await memoryStore.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/memory/:id/archive
 * Archive a memory
 */
memoryRouter.post('/memory/:id/archive', async (req: Request, res: Response) => {
  try {
    const archived = await memoryStore.archive(req.params.id);
    if (!archived) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(archived);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
