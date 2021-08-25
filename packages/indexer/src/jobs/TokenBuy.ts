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
      const listing = await tokenListingRepository.findByChainData(
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

      await tokenListingRepository.update(listing);
    } catch (err) {
      console.log(err);
    }
  }
}
