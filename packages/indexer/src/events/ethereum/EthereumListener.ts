import { RedisClient } from 'redis';
import { EventEmitter } from 'stream';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';

import TokenBuyListener from './TokenBuyListener';
import TokenListingListener from './TokenListingListener';
import TokenMintListener from './TokenMintListener';
import TokenTransferListener from './TokenTransferListener';

export default class EthereumListener extends EventEmitter {
  constructor(web3: Web3, redis: RedisClient) {
    super();

    Contracts.init(web3).then(async () => {
      console.log('Listening to events on the Ethereum network...');

      new TokenMintListener(
        web3,
        redis,
        Contracts.Contracts.Token.get()
      ).listen((job) => {
        this.emit('token-mint', job);
      });

      new TokenTransferListener(
        web3,
        redis,
        Contracts.Contracts.Token.get()
      ).listen((job) => {
        this.emit('token-transfer', job);
      });

      new TokenListingListener(
        web3,
        redis,
        Contracts.Contracts.Market.get()
      ).listen((job) => {
        this.emit('market-list', job);
      });

      new TokenBuyListener(
        web3,
        redis,
        Contracts.Contracts.Market.get()
      ).listen((job) => {
        this.emit('market-buy', job);
      });
    });
  }
}
