import { RedisClient } from 'redis';
import { EventEmitter } from 'stream';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';

import Buy from './Market/Buy';
import ListForSale from './Market/ListForSale';
import Minted from './Token/Minted';
import TransferSingle from './Token/TransferSingle';

export default class EthereumListener extends EventEmitter {
  private web3: Web3;
  private redis: RedisClient;

  constructor(web3: Web3, redis: RedisClient) {
    super();

    this.web3 = web3;
    this.redis = redis;

    Contracts.init(web3).then(async () => {
      Minted((job, blockNumber) => {
        redis.set(
          this.getLastBlockKey(
            'MINTED',
            Contracts.Contracts.Token.get().options.address
          ),
          blockNumber
        );
        this.emit('token-mint', job);
      }, await this.getLastBlock('MINTED', Contracts.Contracts.Token.get().options.address));

      TransferSingle((job) => {
        this.emit('token-transfer', job);
      });

      ListForSale((job) => {
        this.emit('market-list', job);
      });

      Buy((job) => {
        this.emit('market-buy', job);
      });
    });
  }

  getLastBlockKey(eventName: string, contractAddress: string) {
    return `ETH:EVENTS:${eventName.toUpperCase()}:lastBlock:${contractAddress}`;
  }

  getLastBlock(eventName: string, contractAddress: string): Promise<string> {
    const key = this.getLastBlockKey(eventName, contractAddress);

    return new Promise((resolve, reject) => {
      this.redis.get(key, async (err, reply) => {
        if (reply) return resolve(reply);

        try {
          const block = await this.web3.eth.getBlockNumber();
          this.redis.set(key, block.toString());

          resolve(block.toString());
        } catch (err) {
          console.log(err);
        }

        reject(err);
      });
    });
  }
}
