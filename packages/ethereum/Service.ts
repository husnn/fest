/* eslint-disable */

import * as BIP39 from 'bip39';
import Decimal from 'decimal.js';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';

import {
    ERC20Info, EthereumService as IEthereumService, EthereumTx, generateWalletId, Result, Token,
    TokenListing, TxResult, Wallet
} from '@fanbase/core';
import Contracts from '@fanbase/eth-contracts';
import {
    ApproveSpender, ApproveTokenMarket, BuyToken, CancelTokenListing, ListTokenForSale, MintToken
} from '@fanbase/eth-transactions';
import { Price, Protocol, WalletType } from '@fanbase/shared';

import ERC20Abi from './abi/ERC20.json';

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

  async getERC20Balance(
    erc20Address: string,
    walletAddress: string
  ): Promise<string> {
    const contract = new this.web3.eth.Contract(ERC20Abi as any, erc20Address);

    const balance = await contract.methods.balanceOf(walletAddress).call();

    return balance;
  }

  async toERC20Amount(
    address: string,
    amount: string | number
  ): Promise<string> {
    const erc20Info = await this.getERC20Info(address);

    const { decimals } = erc20Info;

    return new Decimal(amount)
      .mul(new Decimal(10).pow(decimals))
      .round()
      .toString();
  }

  async priceFromERC20Amount(address: string, amount: string): Promise<Price> {
    const erc20Info = await this.getERC20Info(address);

    const { name, symbol, decimals } = erc20Info;

    const displayAmount = new Decimal(amount)
      .div(new Decimal(10).pow(decimals))
      .toDecimalPlaces(3);

    const price: Price = {
      currency: {
        contract: address,
        name,
        symbol,
        decimals
      },
      amount,
      displayAmount: parseFloat(displayAmount.toString())
    };

    return price;
  }

  erc20Info: { [address: string]: ERC20Info } = {};

  async getERC20Info(address: string): Promise<ERC20Info> {
    let info = this.erc20Info[address];

    if (info) return info;

    const contract = new this.web3.eth.Contract(ERC20Abi as any, address);

    const name = await contract.methods.name().call();
    const symbol = await contract.methods.symbol().call();
    const decimals = await contract.methods.decimals().call();

    info = { name, symbol, decimals: parseFloat(decimals) };

    this.erc20Info[address] = info;

    return info;
  }

  async buildBuyTokenListingTx(
    walletAddress: string,
    listingContract: string,
    listingId: string,
    quantity: number
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = {
      listingId,
      quantity
    };

    return new BuyToken(txData, listingContract).build(
      walletAddress,
      networkId,
      chainId,
      nonce,
      385000
    );
  }

  async buildApproveERC20SpenderTX(
    erc20Address: string,
    walletAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    return new ApproveSpender(
      this.web3,
      erc20Address,
      spenderAddress,
      amount
    ).build(walletAddress, networkId, chainId, nonce, 385000);
  }

  async getApprovedSpenderERC20Amount(
    erc20Address: string,
    walletAddress: string,
    spenderAddress: string
  ): Promise<string> {
    const contract = new this.web3.eth.Contract(ERC20Abi as any, erc20Address);

    const amount = await contract.methods
      .allowance(walletAddress, spenderAddress)
      .call();

    return amount;
  }

  async buildCancelTokenListingTx(
    walletAddress: string,
    tradeId: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = { tradeId };

    return new CancelTokenListing(txData).build(
      walletAddress,
      networkId,
      chainId,
      nonce,
      385000
    );
  }

  async buildListTokenForSaleTx(
    walletAddress: string,
    tokenContract: string,
    tokenId: string,
    quantity: number,
    price: {
      currency: string;
      amount: string;
    },
    expiry: number,
    salt: string,
    signature: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = {
      seller: walletAddress,
      tokenContract,
      tokenId,
      quantity,
      currency: price.currency,
      price: price.amount,
      expiry,
      salt,
      signature
    };

    return new ListTokenForSale(txData).build(
      walletAddress,
      networkId,
      chainId,
      nonce,
      385000
    );
  }

  async buildApproveMarketTx(
    tokenContract: string,
    walletAddress: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    return new ApproveTokenMarket(tokenContract).build(
      walletAddress,
      networkId,
      chainId,
      nonce
    );
  }

  async checkMarketApproved(
    tokenContract: string,
    walletAddress: string
  ): Promise<boolean> {
    const marketWalletContract = Contracts.Contracts.MarketWallet.get();

    const txResult = await Contracts.Contracts.Token.get(tokenContract)
      .methods.isApprovedForAll(
        walletAddress,
        marketWalletContract.options.address
      )
      .call();

    return txResult;
  }

  async signTokenSale(
    seller: string,
    token: string,
    tokenId: string,
    quantity: number,
    price: {
      currency: string;
      amount: string;
    },
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
        price.currency,
        price.amount,
        expiry,
        salt
      )
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async buildMintTokenTx(
    token: Token,
    wallet: Wallet,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<EthereumTx> {
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

    return new MintToken(txData).build(
      wallet.address,
      networkId,
      chainId,
      nonce
    );
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

  async signAndSendTx(tx: EthereumTx, pk: string): Promise<TxResult> {
    return this.sendTx(tx.signAndSerialize(pk));
  }

  async sendTx(tx: string): Promise<TxResult> {
    return new Promise<TxResult>((resolve) => {
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
