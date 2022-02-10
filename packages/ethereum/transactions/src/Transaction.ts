import Common from '@ethereumjs/common';
import { EthereumTx as IEthereumTx } from '@fest/shared';
import { Transaction as EthereumTx } from 'ethereumjs-tx';
import Web3 from 'web3';

export class Transaction implements IEthereumTx {
  address: string;
  data: any;

  txData: any;
  tx: EthereumTx;

  constructor(address?: string, data?: any) {
    this.address = address;
    this.data = data;
  }

  build(
    from: string,
    networkId?: number,
    chainId?: number,
    nonce?: number,
    opts?: { gasLimit?: number; gasPrice?: number; value?: string }
  ): this {
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.address),
      gasLimit: Web3.utils.toHex(opts?.gasLimit || 200000),
      gasPrice: Web3.utils.toHex(
        Web3.utils.toWei((opts?.gasPrice || 50).toString(), 'Gwei')
      ),
      nonce: Web3.utils.toHex(nonce),
      ...(this.data && { data: this.data }),
      ...(opts?.value && { value: opts.value })
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
