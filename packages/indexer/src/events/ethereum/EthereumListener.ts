import { RedisClient } from 'redis';
import { EventEmitter } from 'stream';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';

import TokenBuyListener from './TokenBuyListener';
import TokenCancelListingListener from './TokenCancelListingListener';
import TokenListingListener from './TokenListingListener';
import TokenMintListener from './TokenMintListener';
import TokenTransferListener from './TokenTransferListener';
import TokenRoyaltyPaymentListener from './TokenRoyaltyPaymentListener';

export default class EthereumListener extends EventEmitter {
  constructor(web3: Web3, redis: RedisClient) {
    super();

    Contracts.init(web3).then(async () => {
      console.log('Listening to events on the Ethereum network...');

      const tokenContract = Contracts.get('Token');
      const marketContract = Contracts.get('Market');

      new TokenMintListener(web3, redis, tokenContract).listen((job) => {
        this.emit('token-mint', job);
      });

      new TokenTransferListener(web3, redis, tokenContract).listen((job) => {
        this.emit('token-transfer', job);
      });

      new TokenListingListener(web3, redis, marketContract).listen((job) => {
        this.emit('market-list', job);
      });

      new TokenCancelListingListener(web3, redis, marketContract).listen(
        (job) => {
          this.emit('market-cancel', job);
        }
      );

      new TokenBuyListener(web3, redis, marketContract).listen((job) => {
        this.emit('market-buy', job);
      });

      new TokenRoyaltyPaymentListener(web3, redis, marketContract).listen(
        (job) => {
          this.emit('market-royalty-payment', job);
        }
      );
    });
  }
}
