import Fortmatic from 'fortmatic';
import Web3 from 'web3';

import { Token, Wallet } from '@fanbase/shared';

export default class EthereumClient {
  web3: Web3 = new Web3();

  static instance: EthereumClient;

  constructor() {
    this.initWeb3();

    EthereumClient.instance = this;
  }

  async initWeb3(): Promise<void> {
    if (typeof window !== 'undefined') {
      let provider: any;
      let ethereum = (window as any).ethereum;

      if (ethereum) {
        ethereum.request({ method: 'eth_requestAccounts' });
        ethereum.web3 = this.web3;
        provider = ethereum;
      } else {
        const fm = new Fortmatic(process.env.NEXT_PUBLIC_FORTMATIC_API_KEY);
        provider = fm.getProvider();
      }

      this.web3.setProvider(provider);
    }
  }

  async getAddress(): Promise<string> {
    return await this.web3.eth.getCoinbase();
  }

  async signMessage(message: string, address: string) {
    return this.web3.eth.personal.sign(message, address, '');
  }

  async mintToken(
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
