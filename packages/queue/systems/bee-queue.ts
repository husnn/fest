import BQ, { Job } from 'bee-queue';
import { JobData, Queue, QueueSystem } from '../types';
import { Result, WrappedError } from '@fest/shared';

import logger from '@fest/logger';
import { redisConfig } from '../config';

class BeeQueue<T> implements Queue<T> {
  name: string;
  serviceName: string;

  private redisUrl: string;

  private beeQueue: BQ;

  constructor(name: string, serviceName: string, redisUrl: string) {
    this.name = name;
    this.serviceName = serviceName;
    this.redisUrl = redisUrl;
  }

  async build(): Promise<Result> {
    try {
      this.beeQueue = new BQ(this.name, {
        prefix: `service:${this.serviceName}:queue`,
        redis: this.redisUrl
      } as BQ.QueueSettings);

      return Result.ok();
    } catch (err) {
      logger.error(err);
      return Result.fail(err);
    }
  }

  async add(job: JobData<T> | JobData<T>[]): Promise<Result> {
    try {
      for (const j of Array.isArray(job) ? job : [job]) {
        await this.beeQueue
          .createJob(j)
          .retries(j.retries || 0)
          .save();
      }

      return Result.ok();
    } catch (err) {
      logger.error(err);
      return Result.fail(new WrappedError(err, 'Could not queue job.'));
    }
  }

  process(cb: (job: JobData<T>) => Promise<void>) {
    this.beeQueue.process((j: Job<JobData<T>>) => cb(j.data));
  }
}

let instance = null;

class BeeQueueSystem implements QueueSystem {
  private serviceName: string;
  private redisUrl: string;

  private queues: { [name: string]: Queue<any> } = {};

  static async get(
    serviceName: string,
    redisUrl?: string
  ): Promise<QueueSystem> {
    if (instance) return instance;

    const beeQueue = new BeeQueueSystem();

    await beeQueue.init(serviceName, redisUrl);
    instance = beeQueue;

    return instance;
  }

  async init(serviceName: string, redisUrl?: string): Promise<QueueSystem> {
    try {
      this.serviceName = serviceName;
      this.redisUrl = redisUrl || redisConfig.url;
      return this;
    } catch (err) {
      logger.error(err);
    }
  }

  async getQueue<T>(name: string): Promise<Queue<T>> {
    let q = this.queues[name];
    if (q) return q;

    q = new BeeQueue<T>(name, this.serviceName, this.redisUrl);

    await q.build();

    return q;
  }
}

export default BeeQueueSystem;
