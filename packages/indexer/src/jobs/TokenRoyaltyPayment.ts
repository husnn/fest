import { NotificationService, WalletRepository } from '@fest/core';
import {
  EthereumService,
  NotificationCategory,
  NotificationPriority,
  NotificationTopic
} from '@fest/shared';
import Job from './Job';
import JobData from './JobData';

export interface TokenRoyaltyPaymentJob extends JobData {
  contract: string;
  token: string;
  tokenId: string;
  receiver: string;
  currency: string;
  amount: string;
}

export class TokenRoyaltyPayment extends Job<TokenRoyaltyPaymentJob> {
  constructor(props: TokenRoyaltyPaymentJob) {
    super(props);
  }

  async execute(
    walletRepository: WalletRepository,
    ethereumService: EthereumService,
    notificationService: NotificationService
  ): Promise<void> {
    try {
      const wallet = await walletRepository.findByAddress(
        this.props.protocol,
        this.props.receiver
      );

      const price = await ethereumService.priceFromERC20Amount(
        this.props.currency,
        this.props.amount
      );

      notificationService.create(wallet.ownerId, {
        priority: NotificationPriority.NORMAL,
        category: NotificationCategory.MARKET,
        topic: NotificationTopic.TOKEN_MARKET_ROYALTY_PAYMENT,
        values: {
          currency: price.currency.symbol,
          amount: price.displayAmount
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default TokenRoyaltyPayment;
