/* eslint-disable */

import * as BIP39 from 'bip39';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';

import {
    EthereumService as IEthereumService, generateWalletId, Result, Token, Wallet
} from '@fanbase/core';
import Contracts from '@fanbase/eth-contracts';
import { MintToken } from '@fanbase/eth-transactions';
import { decryptText, Protocol, WalletType } from '@fanbase/shared';

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

  async signSale(
    seller: string,
    token: string,
    tokenId: string,
    quantity: number,
    currency: string,
    price: string,
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
        currency,
        price,
        expiry,
        salt
      )
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
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

    const chainId = await this.web3.eth.getChainId();

    const tx = new MintToken(txData)
      .build(wallet.address, chainId, nonce)
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

    const hash = await Contracts.Contracts.Token.get()
      .methods.getMintHash(creatorAddress, supply, expiry, salt)
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
