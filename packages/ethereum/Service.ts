import * as BIP39 from 'bip39';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';

import {
    EthereumService as IEthereumService, generateWalletId, Result, Wallet
} from '@fanbase/core';
import Contracts from '@fanbase/eth-contracts';
import { Protocol, WalletType } from '@fanbase/shared';

export class EthereumService implements IEthereumService {
  constructor(web3: Web3) {
    Contracts.init(web3);
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
