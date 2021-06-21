import Web3 from 'web3';

export class Transaction {
  contract: string;
  tx: any;
  txSerialized: string;

  data: any;

  constructor(contract: any, data: any) {
    this.contract = contract;
    this.data = data;
  }

  build(from: string, nonce: number, gasLimit = 180000, gasPrice = 200): this {
    console.log('TO: ' + this.contract);
    const tx = {
      from: Web3.utils.toChecksumAddress(from),
      to: Web3.utils.toChecksumAddress(this.contract),
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
