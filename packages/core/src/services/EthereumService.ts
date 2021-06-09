import { Wallet } from '@fanbase/core';

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
    supply: string,
    salt: string
  ): Promise<
    Result<{
      signature: string;
    }>
  >;

  getOfferHash();
  verifyOffer();
}
