import Web3 from 'web3';

export class Transaction {
  address: string;
  tx: any;
  txSerialized: string;

  data: any;

  constructor(address: string, data: any) {
    this.address = address;
    this.data = data;
  }

  build(from: string, nonce: number, gasLimit = 180000, gasPrice = 200): this {
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.address),
      gasPrice: Web3.utils.toHex(Web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      gasLimit: Web3.utils.toHex(gasLimit),
      nonce: Web3.utils.toHex(nonce),
      data: this.data
    };

    this.tx = tx;

    return this;
  }

  sign(privateKey: string): this {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');
    this.tx.sign(privateKeyBuffer);
    return this;
  }

  serialize(): this {
    const serializedTx = this.tx.serialize();
    this.txSerialized = '0x' + serializedTx.toString('hex');
    return this;
  }
}

export default Transaction;
