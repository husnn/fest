import Web3 from 'web3';

import { MintToken } from '@fanbase/eth-transactions';
import { Token, Wallet } from '@fanbase/shared';

export default class EthereumClient {
  web3: Web3;

  static instance: EthereumClient;

  constructor () {
    this.web3 = new Web3();

    if (typeof window !== 'undefined') {
      const provider = (window as any).ethereum;
      this.web3.setProvider(provider);
    }

    EthereumClient.instance = this;
  }

  async getAddress (): Promise<string> {
    return await this.web3.eth.getCoinbase();
  }

  async signMessage (message: string, address: string) {
    return this.web3.eth.personal.sign(message, address, '');
  }

  async mintToken (
    token: Token,
    wallet: Wallet,
    signature: string
  ): Promise<void> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const data = {
      creator: wallet.address,
      supply: token.supply,
      metadataUri: '',
      fees: [],
      data: '',
      salt: '',
      signature
    };

    // const tx = new MintToken('', data)
    //   .build(wallet.address, nonce)
    //   .sign(wallet.decryptedPrivateKey)
    //   .serialize()

    // await this.web3.eth.sendSignedTransaction(tx.txSerialized);
  }
}
