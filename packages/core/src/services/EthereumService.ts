import { Wallet } from '@fanbase/core';

import { Token } from '../entities';
import { Result } from '../Result';

export interface EthereumService {
  generateWallet(): Promise<Wallet>;

  recoverAddress(
    message: string,
    sig: string
  ): Result<{
    address: string;
  }>;

  checkBalance();

  signMint(
    creatorAddress: string,
    supply: number,
    expiry: number,
    salt: string
  ): Promise<
    Result<{
      signature: string;
    }>
  >;

  mintToken(
    token: Token,
    wallet: Wallet,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<Result<string>>;

  getOfferHash();
  verifyOffer();
}
