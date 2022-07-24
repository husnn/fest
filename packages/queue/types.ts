import { Result } from '@fest/shared';

export type JobData<T> = {
  user?: string;
  data: T;
  retries?: number;
};

export interface Queue<T> {
  build(): Promise<Result>;
  add(job: JobData<T> | JobData<T>[]): Promise<Result<boolean>>;
  process(cb: (job: JobData<T>) => Promise<void>): void;
}

export interface QueueSystem {
  init(serviceName: string, redisUrl?: string): Promise<QueueSystem>;
  getQueue<T>(name: string): Promise<Queue<T>>;
}
