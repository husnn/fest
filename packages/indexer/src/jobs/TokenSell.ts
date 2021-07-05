import { TokenRepository, TokenTrade, TokenTradeRepository, WalletRepository } from '@fanbase/core';
import { Protocol, TokenTradeStatus } from '@fanbase/shared';

import Job from './Job';

export type TokenSellProps = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  seller: string;
  token: string;
  tokenId: string;
  quantity: number;
  currency: string;
  price: string;
};

export default class TokenSell extends Job {
  private protocol: Protocol;
  private tx: string;
  private contract: string;
  private id: string;
  private seller: string;
  private token: string;
  private tokenId: string;
  private quantity: number;
  private currency: string;
  private price: string;

  constructor(props: TokenSellProps) {
    super();

    Object.assign(this, props);
  }

  async execute(
    tokenRepository: TokenRepository,
    walletRepository: WalletRepository,
    tokenTradeRepository: TokenTradeRepository
  ): Promise<void> {
    try {
      const token = await tokenRepository.findByChainData({
        protocol: this.protocol,
        contract: this.token,
        id: this.tokenId
      });

      const wallet = await walletRepository.findByAddress(
        this.protocol,
        this.seller
      );

      const trade = new TokenTrade({
        protocol: this.protocol,
        sellerWalletId: wallet.id,
        tokenId: token.id,
        quantity: this.quantity,
        available: this.quantity,
        currency: this.currency,
        price: this.price,
        chain: {
          contract: this.contract,
          id: this.id,
          tx: this.tx
        },
        status: TokenTradeStatus.Active
      });

      await tokenTradeRepository.create(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
