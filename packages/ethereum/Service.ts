/* eslint-disable */

import * as BIP39 from 'bip39';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';

import {
    EthereumService as IEthereumService, generateWalletId, Result, Token, TokenListing, Wallet
} from '@fanbase/core';
import Contracts from '@fanbase/eth-contracts';
import {
    ApproveSpender, ApproveTokenMarket, BuyToken, CancelTokenListing, ListTokenForSale, MintToken
} from '@fanbase/eth-transactions';
import { decryptText, Price, Protocol, WalletType } from '@fanbase/shared';

export class EthereumService implements IEthereumService {
  static instance: EthereumService;

  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  static async init(web3: Web3) {
    EthereumService.instance = new EthereumService(web3);
    await Contracts.init(web3);
  }

  verifyOffer() {
    throw new Error('Method not implemented.');
  }

  getOfferHash() {
    throw new Error('Method not implemented.');
  }

  fromWei(amount: string): number {
    return parseInt(Web3.utils.fromWei(amount));
  }

  toWei(amount: number): string {
    return Web3.utils.toWei(amount.toString());
  }

  async getPrice(contract: string, wei: string) {
    return {
      currency: 'DAI',
      amount: parseInt(Web3.utils.fromWei(wei))
    };
  }

  async buyTokenListing(
    wallet: Pick<Wallet, 'address' | 'privateKey'>,
    listingContract: string,
    listingId: string,
    quantity: number
  ) {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = {
      listingId,
      quantity
    };

    const tx = new BuyToken(txData, listingContract)
      .build(wallet.address, networkId, chainId, nonce, 385000)
      .signAndSerialize(decryptText(wallet.privateKey));

    return this.sendTransaction(tx);
  }

  async getMarketApprovedERC20Amount(
    erc20Address: string,
    walletAddress: string,
    spenderAddress: string
  ): Promise<string> {
    const abi = [
      {
        constant: true,
        inputs: [
          {
            name: '_owner',
            type: 'address'
          },
          {
            name: '_spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            name: '',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const contract = new this.web3.eth.Contract(abi as any, erc20Address);

    const amount = await contract.methods
      .allowance(walletAddress, spenderAddress)
      .call();

    return amount;
  }

  async approveMarketToSpendERC20(
    erc20Address: string,
    wallet: Pick<Wallet, 'address' | 'privateKey'>,
    spenderAddress: string,
    amount: string
  ): Promise<Result<string>> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const tx = new ApproveSpender(
      this.web3,
      erc20Address,
      spenderAddress,
      amount
    )
      .build(wallet.address, networkId, chainId, nonce, 385000)
      .signAndSerialize(decryptText(wallet.privateKey));

    return this.sendTransaction(tx);
  }

  async getERC20Balance(
    erc20Address: string,
    walletAddress: string
  ): Promise<number> {
    const abi = [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const contract = new this.web3.eth.Contract(abi as any, erc20Address);

    const balance = await contract.methods.balanceOf(walletAddress).call();

    return parseInt(Web3.utils.fromWei(balance, 'ether'));
  }

  async listTokenForSale(
    wallet: Wallet,
    tokenContract: string,
    tokenId: string,
    quantity: number,
    price: Price,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<Result<string>> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = {
      seller: wallet.address,
      tokenContract,
      tokenId,
      quantity,
      currency: price.currency.contract,
      price: price.amount,
      expiry,
      salt,
      signature
    };

    const tx = new ListTokenForSale(txData)
      .build(wallet.address, networkId, chainId, nonce, 385000)
      .signAndSerialize(decryptText(wallet.privateKey));

    return this.sendTransaction(tx);
  }

  async cancelTokenListing(
    wallet: Wallet,
    listing: TokenListing
  ): Promise<Result<string>> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = {
      tradeId: listing.chain.id
    };

    const tx = new CancelTokenListing(txData)
      .build(wallet.address, networkId, chainId, nonce, 385000)
      .signAndSerialize(decryptText(wallet.privateKey));

    return this.sendTransaction(tx);
  }

  async sendTransaction(tx: any): Promise<Result<string>> {
    return new Promise<Result<string>>((resolve) => {
      this.web3.eth
        .sendSignedTransaction(tx)
        .once('transactionHash', (hash: string) => {
          resolve(Result.ok(hash));
        })
        .catch((err) => {
          console.log(err);
          resolve(Result.fail());
        });
    });
  }

  async signTokenSale(
    seller: string,
    token: string,
    tokenId: string,
    quantity: number,
    price: Price,
    expiry: number,
    salt: string
  ): Promise<Result<{ signature: string }>> {
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');

    const hash = await Contracts.Contracts.Market.get()
      .methods.getSaleAuthorizationHash(
        seller,
        token,
        tokenId,
        quantity,
        price.currency.contract,
        price.amount,
        expiry,
        salt
      )
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async approveMarket(
    tokenContract: string,
    wallet: Wallet
  ): Promise<Result<string>> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const tx = new ApproveTokenMarket(tokenContract)
      .build(wallet.address, networkId, chainId, nonce)
      .signAndSerialize(decryptText(wallet.privateKey));

    return new Promise<Result<string>>((resolve) => {
      this.web3.eth
        .sendSignedTransaction(tx)
        .once('transactionHash', (hash: string) => {
          resolve(Result.ok(hash));
        })
        .catch((err) => {
          console.log(err);
          resolve(Result.fail());
        });
    });
  }

  async checkMarketApproved(
    tokenContract: string,
    walletAddress: string
  ): Promise<boolean> {
    const marketWalletContract = Contracts.Contracts.MarketWallet.get();

    return await Contracts.Contracts.Token.get(tokenContract)
      .methods.isApprovedForAll(
        walletAddress,
        marketWalletContract.options.address
      )
      .call();
  }

  async mintToken(
    token: Token,
    wallet: Wallet,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<Result<string>> {
    const nonce = await this.web3.eth.getTransactionCount(
      wallet.address,
      'pending'
    );

    const txData = {
      creator: wallet.address,
      supply: token.supply,
      fees: [],
      data,
      expiry,
      salt,
      signature
    };

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const tx = new MintToken(txData)
      .build(wallet.address, networkId, chainId, nonce)
      .signAndSerialize(decryptText(wallet.privateKey));

    return new Promise<Result<string>>((resolve) => {
      this.web3.eth
        .sendSignedTransaction(tx)
        .once('transactionHash', (hash: string) => {
          resolve(Result.ok(hash));
        })
        .catch((err) => {
          console.log(err);
          resolve(Result.fail());
        });
    });
  }

  async signMint(
    creatorAddress: string,
    supply: number,
    expiry: number,
    salt: string
  ): Promise<Result<{ signature: string }>> {
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');

    const contract = Contracts.Contracts.Token.get();

    const hash = await contract.methods
      .getMintHash(creatorAddress, supply, expiry, salt)
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async checkBalance() {
    console.log('Balance');
  }

  recoverAddress(message: string, sig: string): Result<{ address: string }> {
    const address = sigUtil.recoverPersonalSignature({
      data: message,
      sig: sig
    });

    return Result.ok({ address });
  }

  async generateWallet(): Promise<Wallet> {
    const mnemonic = BIP39.generateMnemonic();

    const seed = await BIP39.mnemonicToSeed(mnemonic);

    const wallet = hdkey
      .fromMasterSeed(seed)
      .derivePath("m/44'/60'/0'/0")
      .getWallet();

    return new Wallet({
      id: generateWalletId(),
      type: WalletType.INTERNAL,
      protocol: Protocol.ETHEREUM,
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKey().toString('hex'),
      privateKey: wallet.getPrivateKey().toString('hex'),
      seed: mnemonic
    });
  }
}
