import EventListener from './EventListener';
import { Protocol } from '@fest/shared';
import { TokenCancelListingJob } from '../../jobs/TokenCancelListing';

export class TokenCancelListingListener extends EventListener<TokenCancelListingJob> {
  EVENT_NAME = 'CancelListing';

  prepareJob(event: any): TokenCancelListingJob {
    const { address, returnValues } = event;

    const { operator, listingId } = returnValues;

    const job: TokenCancelListingJob = {
      protocol: Protocol.ETHEREUM,
      contract: address,
      listingId,
      canceller: operator
    };

    return job;
  }
}

export default TokenCancelListingListener;
