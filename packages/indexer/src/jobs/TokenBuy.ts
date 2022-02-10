import {
  NotificationCategory,
  NotificationPriority,
  NotificationService,
  NotificationTopic,
  TokenListingRepository,
  TokenTrade,
  TokenTradeRepository,
  WalletRepository
} from '@fest/core';
import { TokenListingStatus } from '@fest/shared';
import Job from './Job';
import JobData from './JobData';

export interface TokenBuyJob extends JobData {
  contract: string;
  listingId: string;
  buyer: string;
  quantity: number;
}

export default class TokenBuy extends Job<TokenBuyJob> {
  constructor(props: TokenBuyJob) {
    super(props);
  }

  async execute(
    listingRepository: TokenListingRepository,
    walletRepository: WalletRepository,
    tradeRepository: TokenTradeRepository,
    notificationService: NotificationService
  ): Promise<void> {
    try {
      const listing = await listingRepository.findByChainData(
        this.props.protocol,
        {
          contract: this.props.contract,
          id: this.props.listingId
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

      notificationService.create(listing.sellerId, {
        priority: NotificationPriority.NORMAL,
        category: NotificationCategory.MARKET,
        topic: NotificationTopic.TOKEN_MARKET_SALE,
        values: {
          currency: listing.price.currency.symbol,
          amount: listing.price.displayAmount
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
}
