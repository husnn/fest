import { EthereumTx, Price, Result } from '@fest/shared';

export type ERC20Info = {
  name: string;
  symbol: string;
  decimals: number;
};

export type MarketFees = {
  buyerPct: number;
  sellerPct: number;
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

  buildSendEtherTx(
    from: string,
    to: string,
    amount: string
  ): Promise<EthereumTx>;

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
    fees: MarketFees,
    nonce: string,
    expiry: number
  ): Promise<Result<{ signature: string }>>;

  buildMintTokenProxyTx(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number,
    signature: string
  ): Promise<EthereumTx>;

  buildMintTokenTx(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number,
    signature: string
  ): Promise<EthereumTx>;

  signMint(
    creator: string,
    supply: number,
    uri: string,
    royaltyPct: number,
    data: string,
    nonce: string,
    expiry: number
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

  generateWallet(): Promise<{
    address: string;
    publicKey: string;
    privateKey: string;
    seed: string;
  }>;
}
