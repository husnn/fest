import {
  TokenListingRepository,
  TokenTrade,
  TokenTradeRepository,
  WalletRepository
} from '@fanbase/core';
import { Protocol, TokenListingStatus } from '@fanbase/shared';

import Job from './Job';

export type TokenBuyJob = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  buyer: string;
  quantity: number;
};

export default class TokenBuy extends Job<TokenBuyJob> {
  constructor(props: TokenBuyJob) {
    super(props);
  }

  async execute(
    listingRepository: TokenListingRepository,
    walletRepository: WalletRepository,
    tradeRepository: TokenTradeRepository
  ): Promise<void> {
    try {
      const listing = await listingRepository.findByChainData(
        this.props.protocol,
        {
          contract: this.props.contract,
          id: this.props.id
        }
      );

      listing.available =
        this.props.quantity < listing.available
          ? listing.available - this.props.quantity
          : 0;

      if (listing.available == 0) listing.status = TokenListingStatus.Sold;

      await listingRepository.update(listing);

      const buyerWallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.buyer
      );
      if (!buyerWallet) return;

      const trade = new TokenTrade({
        sellerId: listing.sellerId,
        buyerId: buyerWallet.ownerId,
        tokenListingId: listing.id,
        quantity: this.props.quantity
      });

      await tradeRepository.create(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
