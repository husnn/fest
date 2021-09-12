import { Wallet } from '@fanbase/core';
import { Price } from '@fanbase/shared';

import { EthereumTx, Token } from '../entities';
import { Result } from '../Result';

export type ERC20Info = {
  name: string;
  symbol: string;
  decimals: number;
};

export type TxResult = Result<string>;

export interface EthereumService {
  getOfferHash();
  verifyOffer();

  getERC20Balance(address: string, walletAddress: string): Promise<string>;

  priceFromERC20Amount(address: string, amount: string): Promise<Price>;

  getERC20Info(address: string): Promise<ERC20Info>;

  buildBuyTokenListingTx(
    walletAddress: string,
    listingContract: string,
    listingId: string,
    quantity: number
  ): Promise<EthereumTx>;

  buildApproveERC20SpenderTX(
    erc20Address: string,
    walletAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<EthereumTx>;

  getApprovedSpenderERC20Amount(
    erc20Address: string,
    walletAddress: string,
    spenderAddress: string
  ): Promise<string>;

  buildCancelTokenListingTx(
    walletAddress: string,
    tradeId: string
  ): Promise<EthereumTx>;

  buildListTokenForSaleTx(
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
  ): Promise<EthereumTx>;

  buildApproveMarketTx(
    tokenContract: string,
    walletAddress: string
  ): Promise<EthereumTx>;

  checkMarketApproved(
    tokenContract: string,
    walletAddress: string
  ): Promise<boolean>;

  signTokenSale(
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
  ): Promise<Result<{ signature: string }>>;

  buildMintTokenTx(
    token: Token,
    wallet: Wallet,
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<EthereumTx>;

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

  signAndSendTx(tx: EthereumTx, pk: string): Promise<TxResult>;

  sendTx(tx: string): Promise<TxResult>;

  recoverAddress(
    message: string,
    sig: string
  ): Result<{
    address: string;
  }>;

  generateWallet(): Promise<Wallet>;
}
