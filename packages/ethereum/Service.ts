import * as BIP39 from 'bip39';
import * as sigUtil from 'eth-sig-util';
import { hdkey } from 'ethereumjs-wallet';
import Web3 from 'web3';

import { EthereumService as IEthereumService, Result } from '@fanbase/core';
import { Contracts } from '@fanbase/eth-contracts';
import { Protocol, Wallet, WalletType } from '@fanbase/shared';

export class EthereumService implements IEthereumService {
  private tokenContract?: any;
  private daiContract?: any;

  constructor (web3: Web3) {
    this.tokenContract = new web3.eth.Contract(
      Contracts.Token.interface as any,
      Contracts.Token.getAddress()
    );
  }

  verifyOffer () {
    throw new Error('Method not implemented.');
  }

  getOfferHash () {
    throw new Error('Method not implemented.');
  }

  async signMint (
    creatorAddress: string,
    supply: string,
    salt: string
  ): Promise<Result<{ signature: string }>> {
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');

    const hash = await this.tokenContract.methods
      .mintHashMsg(
        creatorAddress,
        // supply,
        salt
      )
      .call();

    const signature = sigUtil.personalSign(privateKey, { data: hash });

    return Result.ok({ signature });
  }

  async checkBalance () {
    const balance = await this.daiContract.methods.balanceOf();
  }

  recoverAddress (message: string, sig: string): Result<{ address: string }> {
    const address = sigUtil.recoverPersonalSignature({
      data: message,
      sig: sig
    });

    return Result.ok({ address });
  }

  async generateWallet (): Promise<Wallet> {
    const mnemonic = BIP39.generateMnemonic();

    const seed = await BIP39.mnemonicToSeed(mnemonic);

    const wallet = hdkey
      .fromMasterSeed(seed)
      .derivePath('m/44\'/60\'/0\'/0')
      .getWallet();

    return new Wallet({
      type: WalletType.INTERNAL,
      protocol: Protocol.ETHEREUM,
      address: wallet.getAddressString(),
      publicKey: wallet.getPublicKey().toString('hex'),
      privateKey: wallet.getPrivateKey().toString('hex'),
      seed: mnemonic
    });
  }
}
