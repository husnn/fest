import { EthereumTx, Price, TokenFee } from '@fanbase/shared';

import { Result } from '../Result';
import { Wallet } from '@fanbase/core';

export type ERC20Info = {
  name: string;
  symbol: string;
  decimals: number;
};

export type TxResult = Result<string>;

export interface EthereumService {
  networkId: number;
  chainId: number;

  getOfferHash();
  verifyOffer();

  getERC20Balance(address: string, walletAddress: string): Promise<string>;

  toERC20Amount(address: string, amount: string | number): Promise<string>;

  priceFromERC20Amount(address: string, amount: string): Promise<Price>;

  getERC20Info(address: string): Promise<ERC20Info>;

  getEtherBalance(walletAddress: string): Promise<string>;

  buildWithdrawMarketEarningsTx(
    walletAddress: string,
    currencyContract: string,
    amount: string,
    marketContract?: string
  ): Promise<EthereumTx>;

  getMarketEarnings(
    walletAddress: string,
    marketContract?: string
  ): Promise<string>;

  buildBuyTokenListingTx(
    walletAddress: string,
    listingContract: string,
    listingId: string,
    quantity: number
  ): Promise<EthereumTx>;

  buildTransferERC20Tx(
    currency: string,
    from: string,
    to: string,
    amount: string
  ): Promise<EthereumTx>;

  buildApproveERC20SpenderTx(
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
    listingContract: string,
    listingId: string
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

  buildMintTokenProxyTx(
    creator: string,
    supply: number,
    uri: string,
    fees: TokenFee[],
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<EthereumTx>;

  buildMintTokenTx(
    walletAddress: string,
    supply: number,
    uri: string,
    fees: TokenFee[],
    data: string,
    expiry: number,
    salt: string,
    signature: string
  ): Promise<EthereumTx>;

  signMint(
    creatorAddress: string,
    supply: number,
    uri: string,
    expiry: number,
    salt: string
  ): Promise<
    Result<{
      signature: string;
    }>
  >;

  signAndSendTx(tx: EthereumTx, pk: string): Promise<TxResult>;

  sendSignedTx(tx: string): Promise<TxResult>;

  recoverAddress(
    message: string,
    sig: string
  ): Result<{
    address: string;
  }>;

  generateWallet(): Promise<Wallet>;
}
