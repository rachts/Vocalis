import { Router, Request, Response } from 'express';
import { jobQueue } from '../jobs/queue';

export const jobsRouter = Router();

jobsRouter.get('/jobs', (req: Request, res: Response) => {
  const jobs = jobQueue.getAllJobs();
  res.json({ jobs });
});
