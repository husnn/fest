import Fortmatic from 'fortmatic';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';
import {
    ApproveTokenMarket, ListTokenForSale, MintToken, SignOffer, TransferToken
} from '@fanbase/eth-transactions';
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

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
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
    }).build(buyer, networkId, chainId, nonce);

    this.web3.eth.call(tx.txData);
  }

  async listForSale(
    token: TokenDTO,
    quantity: number,
    currency: string,
    price: number,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      seller: account,
      tokenContract: token.chain.contract,
      tokenId: token.chain.id,
      quantity,
      currencyContract: currency,
      price,
      expiry,
      salt,
      signature
    };

    const tx = new ListTokenForSale(txData).build(
      account,
      networkId,
      chainId,
      nonce,
      385000
    );

    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx.txData, (err: Error, hash: string) => {
        if (!err) resolve(hash);
        reject();
      });
    });
  }

  async checkMarketApproval(address?: string): Promise<boolean> {
    const account = address || (await this.getAccount());

    const tokenContract = Contracts.Contracts.Token.get();
    const marketWalletContract = Contracts.Contracts.MarketWallet.get();

    const isApproved = await tokenContract.methods
      .isApprovedForAll(account, marketWalletContract.options.address)
      .call();

    return isApproved;
  }

  async giveToken(
    token: TokenDTO,
    to: string,
    quantity: number
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      from: account,
      to,
      id: token.chain.id,
      quantity
    };

    const tx = new TransferToken(txData).build(
      account,
      networkId,
      chainId,
      nonce
    );

    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx.txData, (err: Error, hash: string) => {
        if (!err) resolve(hash);
        reject();
      });
    });
  }

  async approveMarket(): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const tx = new ApproveTokenMarket().build(
      account,
      networkId,
      chainId,
      nonce
    );

    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx.txData, (err: Error, hash: string) => {
        if (!err) resolve(hash);
        reject();
      });
    });
  }

  async mintToken(
    token: TokenDTO,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<string> {
    const account = await this.getAccount();

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');

    const txData = {
      creator: account,
      supply: token.supply,
      fees: [],
      data,
      expiry,
      salt,
      signature
    };

    const tx = new MintToken(txData).build(account, networkId, chainId, nonce);

    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx.txData, (err: Error, hash: string) => {
        if (!err) resolve(hash);
        reject();
      });
    });
  }

  async awaitTxConfirmation(hash: string): Promise<boolean> {
    return true;
  }
}
