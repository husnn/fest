import Common from '@ethereumjs/common';
import { Transaction as EthereumTx } from 'ethereumjs-tx';
import { EthereumTx as IEthereumTx } from '@fest/shared';
import Web3 from 'web3';

export class Transaction implements IEthereumTx {
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
    networkId?: number,
    chainId?: number,
    nonce?: number,
    gasLimit = 200000,
    gasPrice = 50
  ): this {
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.address),
      gasPrice: Web3.utils.toHex(Web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      gasLimit: Web3.utils.toHex(gasLimit),
      nonce: Web3.utils.toHex(nonce),
      data: this.data
    };

    const common = Common.forCustomChain(
      'mainnet',
      {
        name: 'fest',
        networkId,
        chainId
      },
      'petersburg'
    );

    // eslint-disable-next-line
    // @ts-ignore
    this.tx = new EthereumTx(tx, { common });

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
