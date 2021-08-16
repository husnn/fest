import { TokenListingRepository } from '@fanbase/core';
import { Protocol, TokenListingStatus } from '@fanbase/shared';

import Job from './Job';

export type TokenCancelListingJob = {
  protocol: Protocol;
  contract: string;
  tradeId: string;
  canceller: string;
};

export default class TokenCancelListing extends Job<TokenCancelListingJob> {
  constructor(props: TokenCancelListingJob) {
    super(props);
  }

  async execute(listingRepository: TokenListingRepository): Promise<void> {
    try {
      const listing = await listingRepository.findByChainData(
        this.props.protocol,
        { contract: this.props.contract, id: this.props.tradeId }
      );

      if (!listing) return;

      listing.status = TokenListingStatus.Cancelled;

      await listingRepository.update(listing);
    } catch (err) {
      console.log(err);
    }
  }
}
