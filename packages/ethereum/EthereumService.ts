/* eslint-disable */
import Contracts from '@fest/eth-contracts';
import {
  ApproveSpender,
  ApproveTokenMarket,
  BuyToken,
  CancelTokenListing,
  ListTokenForSale,
  MintToken,
  Transaction,
  TransferERC20,
  WithdrawMarketEarnings
} from '@fest/eth-transactions';
import {
  ERC20Info,
  EthereumService as IEthereumService,
  EthereumTx,
  MarketFees,
  Price,
  Result,
  TxResult
} from '@fest/shared';
import * as BIP39 from 'bip39';
import Decimal from 'decimal.js';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';
import ERC20Abi from './abi/ERC20.json';

export class EthereumService implements IEthereumService {
  static instance: EthereumService;

  private web3: Web3;

  networkId: number;
  chainId: number;

  contracts;

  private initialized = false;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  async init(web3: Web3) {
    this.networkId = await web3.eth.net.getId();
    this.chainId = await web3.eth.getChainId();

    this.contracts = await Contracts.init(web3);

    this.initialized = true;
  }

  static async getInstance(web3?: Web3) {
    if (!this.instance) {
      if (!web3) throw new Error('Ethereum service not yet initialized.');
      this.instance = new EthereumService(web3);
    }

    if (!this.instance.initialized) await this.instance.init(web3);

    return this.instance;
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
      .toFixed();
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

  async getEtherBalance(walletAddress: string): Promise<string> {
    return this.web3.eth.getBalance(walletAddress);
  }

  async buildSendEtherTx(
    from: string,
    to: string,
    amount: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(from, 'pending');

    return new Transaction(to).build(
      from,
      this.networkId,
      this.chainId,
      nonce,
      {
        gasLimit: 21000,
        value: Web3.utils.toHex(Web3.utils.toWei(amount, 'ether'))
      }
    );
  }

  async buildWithdrawMarketEarningsTx(
    walletAddress: string,
    currencyContract: string,
    amount: string,
    marketContract?: string
  ): Promise<EthereumTx> {
    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const txData = { currencyContract, amount };

    return new WithdrawMarketEarnings(txData, marketContract).build(
      walletAddress,
      networkId,
      chainId,
      nonce,
      { gasLimit: 385000 }
    );
  }

  async getMarketEarnings(
    walletAddress: string,
    currencyContract: string,
    marketContract?: string
  ): Promise<string> {
    const contract = Contracts.get('Market', marketContract);

    const balance = await contract.methods
      .balance(walletAddress, currencyContract)
      .call();

    return balance;
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
      { gasLimit: 385000 }
    );
  }

  async buildTransferERC20Tx(
    currency: string,
    walletAddress: string,
    recipientAddress: string,
    amount: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    return new TransferERC20(
      this.web3,
      currency,
      recipientAddress,
      amount
    ).build(walletAddress, networkId, chainId, nonce, { gasLimit: 385000 });
  }

  async buildApproveERC20SpenderTx(
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
    ).build(walletAddress, networkId, chainId, nonce, { gasLimit: 385000 });
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
    listingContract: string,
    listingId: string
  ): Promise<EthereumTx> {
    const nonce = await this.web3.eth.getTransactionCount(
      walletAddress,
      'pending'
    );

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    const txData = { listingId };

    return new CancelTokenListing(txData, listingContract).build(
      walletAddress,
      networkId,
      chainId,
      nonce,
      { gasLimit: 385000 }
    );
  }

  async buildListTokenForSaleTx(
    seller: string,
    token: string,
    tokenId: string,
    quantity: number,
    price: {
      currency: string;
      amount: string;
    },
    fees: MarketFees,
    nonce: string,
    expiry: number,
    signature: string
  ): Promise<EthereumTx> {
    const txNonce = await this.web3.eth.getTransactionCount(seller, 'pending');

    const txData = {
      seller,
      token,
      tokenId,
      quantity,
      currency: price.currency,
      price: price.amount,
      fees,
      maxPerBuyer: 0,
      expiry: 0,
      approval: {
        nonce,
        expiry,
        signature
      }
    };

    return new ListTokenForSale(txData).build(
      seller,
      this.networkId,
      this.chainId,
      txNonce,
      { gasLimit: 385000 }
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
    const marketWalletContract = Contracts.get('Market');

    const txResult = await Contracts.get('Token', tokenContract)
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
    fees: MarketFees,
    nonce: string,
    expiry: number
  ): Promise<Result<{ signature: string }>> {
    const privateKey = Buffer.from(process.env.ETH_WALLET_PK, 'hex');

    const hash = await Contracts.get('Market')
      .methods.listingHash(
        seller,
        token,
        tokenId,
        quantity,
        price.currency,
        price.amount,
        fees,
        0,
        0,
        nonce,
        expiry
      )
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async buildMintTokenTx(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number,
    signature: string
  ): Promise<EthereumTx> {
    const txNonce = await this.web3.eth.getTransactionCount(creator, 'pending');

    const txData = {
      creator,
      supply,
      uri,
      royaltyPct,
      data,
      nonce,
      expiry,
      signature
    };

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    return new MintToken(txData).build(creator, networkId, chainId, txNonce, {
      gasLimit: 385000
    });
  }

  async buildMintTokenProxyTx(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number,
    signature: string
  ): Promise<EthereumTx> {
    const txNonce = await this.web3.eth.getTransactionCount(
      process.env.ETH_WALLET_ADDRESS,
      'pending'
    );

    const txData = {
      creator,
      supply,
      uri,
      royaltyPct,
      data,
      nonce,
      expiry,
      signature
    };

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();

    return new MintToken(txData).build(
      process.env.ETH_WALLET_ADDRESS,
      networkId,
      chainId,
      txNonce,
      { gasLimit: 385000 }
    );
  }

  async signMint(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number
  ): Promise<Result<{ signature: string }>> {
    const privateKey = Buffer.from(process.env.ETH_WALLET_PK, 'hex');

    const contract = Contracts.get('Token');

    const hash = await contract.methods
      .mintHash(creator, supply, uri, royaltyPct, data, nonce, expiry)
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async signAndSendTx(tx: EthereumTx, pk: string): Promise<TxResult> {
    return this.sendSignedTx(tx.signAndSerialize(pk));
  }

  async sendSignedTx(tx: string): Promise<TxResult> {
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

  async sendTx(tx: EthereumTx): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.web3.eth
        .sendTransaction(tx.txData)
        .once('transactionHash', (hash: string) => {
          resolve(hash);
        })
        .catch((err) => {
          reject();
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

  async generateWallet(): Promise<{
    address: string;
    publicKey: string;
    privateKey: string;
    seed: string;
  }> {
    const mnemonic = BIP39.generateMnemonic();

    const seed = await BIP39.mnemonicToSeed(mnemonic);

    const wallet = hdkey
      .fromMasterSeed(seed)
      .derivePath("m/44'/60'/0'/0")
      .getWallet();

    return {
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKey().toString('hex'),
      privateKey: wallet.getPrivateKey().toString('hex'),
      seed: mnemonic
    };
  }
}
