import { Transaction as EthereumTx } from 'ethereumjs-tx';
import Web3 from 'web3';

export class Transaction {
  address: string;
  txData: any;
  txSigned: string;
  txSerialized: string;

  data: any;

  constructor(address: string, data: any) {
    this.address = address;
    this.data = data;
  }

  build(from: string, nonce: number, gasLimit = 180000, gasPrice = 20): this {
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.address),
      gasPrice: Web3.utils.toHex(Web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      gasLimit: Web3.utils.toHex(gasLimit),
      nonce: Web3.utils.toHex(nonce),
      data: this.data
    };

    this.txData = tx;

    return this;
  }

  signAndSerialize(privateKey: string): string {
    const tx = new EthereumTx(this.txData);

    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    tx.sign(privateKeyBuffer);

    return '0x' + tx.serialize().toString('hex');
  }
}

export default Transaction;
