import { eventBus, SystemEvents } from '../events/bus';

export class Logger {
  static info(message: string, context?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static metric(name: string, durationMs: number) {
    console.log(`[METRIC] ${name}: ${durationMs}ms`);
    eventBus.emit(SystemEvents.LatencyMetric, { name, durationMs });
  }

  static trackExecutionTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    return fn().then(result => {
      this.metric(name, Date.now() - start);
      return result;
    }).catch(err => {
      this.metric(`${name}_failed`, Date.now() - start);
      throw err;
    });
  }
}
