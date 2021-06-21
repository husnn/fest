import { EventEmitter } from 'stream';
import Web3 from 'web3';

import Minted from './Token/Minted';
import TransferSingle from './Token/TransferSingle';

export default class EthereumListener extends EventEmitter {
  constructor(web3: Web3) {
    super();

    Minted(web3, (job) => {
      this.emit('token-mint', job);
    });

    TransferSingle(web3, (job) => {
      this.emit('token-transfer', job);
    });
  }
}
