import { Transaction as EthereumTx } from 'ethereumjs-tx';
import Web3 from 'web3';

import Common from '@ethereumjs/common';

export class Transaction {
  address: string;
  data: any;

  txData: any;
  tx: EthereumTx;

  constructor(address: string, data: any) {
    this.address = address;
    this.data = data;
  }

  build(
    from: string,
    chainId: number,
    nonce: number,
    gasPrice = 20,
    gasLimit = 200000
  ): this {
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.address),
      gasPrice: Web3.utils.toHex(Web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      gasLimit: Web3.utils.toHex(gasLimit),
      nonce: Web3.utils.toHex(nonce),
      data: this.data
    };

    // const customCommon = Common.forCustomChain(
    //   'mainnet',
    //   {
    //     name: 'polygon-mumbai',
    //     networkId: 80001,
    //     chainId: 80001
    //   },
    //   'petersburg'
    // );

    this.tx = new EthereumTx(tx, { chain: chainId });

    this.txData = tx;

    return this;
  }

  signAndSerialize(privateKey: string): string {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    this.tx.sign(privateKeyBuffer);

    return '0x' + this.tx.serialize().toString('hex');
  }
}

export default Transaction;
