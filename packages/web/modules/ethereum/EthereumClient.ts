import Fortmatic from 'fortmatic';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';
import { MintToken, SignOffer } from '@fanbase/eth-transactions';
import { TokenDTO } from '@fanbase/shared';

export default class EthereumClient {
  private isInitialized = false;

  web3: Web3 = new Web3(process.env.NEXT_PUBLIC_ETH_PROVIDER);

  static instance: EthereumClient;

  constructor() {
    EthereumClient.instance = this;
    return this;
  }

  async initWeb3(): Promise<void> {
    if (typeof window !== 'undefined') {
      let provider: any;
      const ethereum = (window as any).ethereum;

      if (ethereum) {
        ethereum.web3 = this.web3;
        provider = ethereum;
      } else {
        const fm = new Fortmatic(process.env.NEXT_PUBLIC_FORTMATIC_API_KEY, {
          rpcUrl: process.env.NEXT_PUBLIC_ETH_PROVIDER,
          chainId: parseInt(process.env.NEXT_PUBLIC_ETH_CHAIN)
        });

        // const fm = new Fortmatic(
        //   process.env.NEXT_PUBLIC_FORTMATIC_API_KEY,
        //   'ropsten'
        // );

        provider = fm.getProvider();
      }

      this.isInitialized = true;
      this.web3.setProvider(provider);

      Contracts.init(this.web3);
    }
  }

  async getAccount(): Promise<string> {
    if (!this.isInitialized) await this.initWeb3();

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      await ethereum.request({ method: 'eth_requestAccounts' });
    }

    return await this.web3.eth.getCoinbase();
  }

  async signMessage(message: string, address: string) {
    return this.web3.eth.personal.sign(message, address, '');
  }

  async signOffer(
    seller: string,
    contract: string,
    id: string,
    quantity: number,
    currency: string,
    price: string,
    expiry: number,
    salt: string
  ): Promise<void> {
    const buyer = await this.getAccount();

    const nonce = await this.web3.eth.getTransactionCount(buyer, 'pending');

    const tx = new SignOffer({
      offer: {
        buyer,
        seller,
        token: contract,
        tokenId: id,
        quantity,
        currency,
        price,
        expiry
      },
      salt
    }).build(buyer, nonce);

    this.web3.eth.call(tx.tx);
  }

  async mintToken(
    token: TokenDTO,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<void> {
    const creator = await this.getAccount();

    const nonce = await this.web3.eth.getTransactionCount(creator, 'pending');

    const txData = {
      creator,
      supply: token.supply,
      fees: [],
      data,
      expiry,
      salt,
      signature
    };

    const tx = new MintToken(txData).build(creator, nonce);

    this.web3.eth.sendTransaction(tx.tx);
  }
}
