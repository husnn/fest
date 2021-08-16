import { Wallet } from '@fanbase/core';

import { Token, TokenListing } from '../entities';
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

  listTokenForSale(
    wallet: Wallet,
    tokenContract: string,
    tokenId: string,
    quantity: number,
    currency: string,
    price: number,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<Result<string>>;

  signTokenSale(
    seller: string,
    token: string,
    tokenId: string,
    quantity: number,
    currency: string,
    price: number,
    expiry: number,
    salt: string
  ): Promise<Result<{ signature: string }>>;

  cancelTokenListing(
    wallet: Wallet,
    listing: TokenListing
  ): Promise<Result<string>>;

  approveMarket(tokenContract: string, wallet: Wallet): Promise<Result<string>>;

  checkMarketApproved(
    tokenContract: string,
    walletAddress: string
  ): Promise<boolean>;

  mintToken(
    token: Token,
    wallet: Wallet,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<Result<string>>;

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

  getOfferHash();
  verifyOffer();
}
