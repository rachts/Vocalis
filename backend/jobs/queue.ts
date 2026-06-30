import { Logger } from '../utils/logger';
import { eventBus, SystemEvents } from '../events/bus';
import { randomUUID } from 'crypto';

export interface Job {
  id: string;
  name: string;
  payload: any;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  result?: any;
  error?: string;
}

export class JobQueue {
  private jobs: Map<string, Job> = new Map();

  async dispatch(name: string, payload: any, executeFn: () => Promise<any>): Promise<string> {
    const id = randomUUID();
    
    this.jobs.set(id, {
      id,
      name,
      payload,
      status: 'PENDING'
    });

    Logger.info(`Job ${id} dispatched: ${name}`);

    // Fire and forget execution to not block the main thread
    this.processJob(id, executeFn).catch(e => {
        Logger.error(`Job processor failed for ${id}`, e);
    });

    return id;
  }

  private async processJob(id: string, executeFn: () => Promise<any>) {
    const job = this.jobs.get(id);
    if (!job) return;

    job.status = 'RUNNING';
    
    try {
      const result = await executeFn();
      job.status = 'COMPLETED';
      job.result = result;
      Logger.info(`Job ${id} completed`);
      eventBus.emit(SystemEvents.BackgroundJobCompleted, { id, result });
    } catch (err: any) {
      job.status = 'FAILED';
      job.error = err.message;
      Logger.error(`Job ${id} failed`, err);
      eventBus.emit(SystemEvents.BackgroundJobCompleted, { id, error: err.message });
    }
  }

  async schedule(name: string, payload: any, executeFn: () => Promise<any>, delayMs: number): Promise<string> {
    const id = randomUUID();
    
    this.jobs.set(id, {
      id,
      name,
      payload,
      status: 'PENDING'
    });

    Logger.info(`Job ${id} scheduled: ${name} in ${delayMs}ms`);

    setTimeout(() => {
      this.processJob(id, executeFn).catch(e => {
          Logger.error(`Job processor failed for ${id}`, e);
      });
    }, delayMs);

    return id;
  }

  getJobStatus(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }
}

export const jobQueue = new JobQueue();
