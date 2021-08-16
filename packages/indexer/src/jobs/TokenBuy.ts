import { TokenListingRepository } from '@fanbase/core';
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

  async execute(tokenListingRepository: TokenListingRepository): Promise<void> {
    try {
      const trade = await tokenListingRepository.findByChainData(
        this.props.protocol,
        {
          contract: this.props.contract,
          id: this.props.id
        }
      );

      const available =
        this.props.quantity < trade.available
          ? trade.available - this.props.quantity
          : 0;

      if (available == 0) trade.status = TokenListingStatus.Sold;

      await tokenListingRepository.update(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
