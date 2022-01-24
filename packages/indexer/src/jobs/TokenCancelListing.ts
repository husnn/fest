import { Protocol, TokenListingStatus } from '@fest/shared';

import Job from './Job';
import { TokenListingRepository } from '@fest/core';

export type TokenCancelListingJob = {
  protocol: Protocol;
  contract: string;
  listingId: string;
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
        { contract: this.props.contract, id: this.props.listingId }
      );

      if (!listing) return;

      listing.status = TokenListingStatus.Cancelled;

      await listingRepository.update(listing);
    } catch (err) {
      console.log(err);
    }
  }
}
