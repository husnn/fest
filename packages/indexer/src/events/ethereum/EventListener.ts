import { RedisClient } from 'redis';
import Web3 from 'web3';

import JobData from '../../jobs/JobData';

export abstract class EventListener<T extends JobData> {
  abstract EVENT_NAME: string;
  POLLING_INTERVAL = 10000;

  private web3: Web3;
  private redis: RedisClient;

  private contract;
  private contractAddress: string;

  private lastBlock: number;

  constructor(web3: Web3, redis: RedisClient, contract: any) {
    this.web3 = web3;
    this.redis = redis;

    this.contract = contract;
    this.contractAddress = contract.options.address;
  }

  abstract prepareJob(event: any): T;

  checkForEvents(callback): void {
    this.contract
      .getPastEvents(this.EVENT_NAME, {
        fromBlock: this.lastBlock + 1,
        toBlock: 'latest'
      })
      .then((events: any) => callback(events));
  }

  async listen(callback): Promise<void> {
    this.lastBlock = await this.getLastBlock();

    setInterval(() => {
      this.checkForEvents((events) => {
        // console.log(`Listening to new events for ${this.EVENT_NAME}`);

        for (const event of events) {
          console.log(`\nNew event: ${this.EVENT_NAME}`);

          const { blockNumber } = event;
          this.updateLastBlock(blockNumber);

          const job = this.prepareJob(event);

          if (job) callback(job);
        }
      });
    }, this.POLLING_INTERVAL);
  }

  getLastBlockKey(): string {
    return `ETH:EVENTS:${this.EVENT_NAME.toUpperCase()}:lastBlock:${
      this.contractAddress
    }`;
  }

  updateLastBlock(blockNumber: number): void {
    this.lastBlock = blockNumber;
    this.redis.set(this.getLastBlockKey(), blockNumber.toString());
  }

  getLastBlock(): Promise<number> {
    const key = this.getLastBlockKey();

    return new Promise((resolve, reject) => {
      this.redis.get(key, async (err, reply) => {
        if (reply) return resolve(parseInt(reply));

        try {
          const block = await this.web3.eth.getBlockNumber();
          this.redis.set(key, block.toString());

          resolve(block);
        } catch (err) {
          console.log(err);
        }

        reject(err);
      });
    });
  }
}

export default EventListener;
