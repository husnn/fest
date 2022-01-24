import { waitUntil } from '@fest/shared';
import { RedisClient } from 'redis';
import Web3 from 'web3';

import JobData from '../../jobs/JobData';

export abstract class EventListener<T extends JobData> {
  abstract EVENT_NAME: string;
  POLLING_INTERVAL = 10000;
  MAX_BLOCKS = 1000;

  private web3: Web3;
  private redis: RedisClient;

  private contract;
  private contractAddress: string;

  constructor(web3: Web3, redis: RedisClient, contract: any) {
    this.web3 = web3;
    this.redis = redis;

    this.contract = contract;
    this.contractAddress = contract.options.address;
  }

  abstract prepareJob(event: any): T;

  async checkForEvents(lastBlock: number, callback): Promise<void> {
    const latestBlock = await this.web3.eth.getBlockNumber();

    const events = [];

    const getNewEvents = (from: number, to: number) =>
      this.contract.getPastEvents(this.EVENT_NAME, {
        fromBlock: from,
        toBlock: to
      });

    // console.log(`\nLatest block: ${latestBlock}`);

    let isFirstLoop = true;

    while (lastBlock < latestBlock) {
      if (!isFirstLoop) await waitUntil(this.POLLING_INTERVAL);

      let toBlock = lastBlock + this.MAX_BLOCKS + 1;

      if (toBlock > latestBlock)
        toBlock = lastBlock + (latestBlock - lastBlock);

      // console.log(`\nFrom block ${lastBlock + 1}`);
      // console.log(`To block ${toBlock}`);

      try {
        const newEvents = await getNewEvents(lastBlock + 1, toBlock);
        events.push(...newEvents);
        lastBlock = toBlock;
      } catch (err) {
        console.log(err);
      }

      isFirstLoop = false;
    }

    callback(events, latestBlock);
  }

  async listen(callback, lastBlock?: number): Promise<void> {
    const startingBlock = lastBlock || (await this.getLastBlock());

    this.checkForEvents(startingBlock, async (events: [], toBlock: number) => {
      this.updateLastBlock(toBlock);

      // console.log(`\nReceived ${events.length} new ${this.EVENT_NAME} events.`);

      for (const event of events) {
        console.log(`\nNew event: ${this.EVENT_NAME}`);

        const job = this.prepareJob(event);

        if (job) callback(job);
      }

      waitUntil(this.POLLING_INTERVAL).then(() => {
        this.listen(callback, toBlock);
      });
    });
  }

  getLastBlockKey(): string {
    return `ETH:EVENTS:${this.EVENT_NAME.toUpperCase()}:lastBlock:${
      this.contractAddress
    }`;
  }

  updateLastBlock(blockNumber: number): void {
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
