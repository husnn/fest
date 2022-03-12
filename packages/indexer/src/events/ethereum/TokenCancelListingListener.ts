import { Protocol } from '@fest/shared';
import { TokenCancelListingJob } from '../../jobs/TokenCancelListing';
import EventListener from './EventListener';

export class TokenCancelListingListener extends EventListener<TokenCancelListingJob> {
  EVENT_NAME = 'Cancel';

  prepareJob(event: any): TokenCancelListingJob {
    const { transactionHash, address, returnValues } = event;

    const { listingId, operator } = returnValues;

    const job: TokenCancelListingJob = {
      protocol: Protocol.ETHEREUM,
      networkId: this.networkId,
      txHash: transactionHash,
      contract: address,
      listingId,
      canceller: operator
    };

    return job;
  }
}

export default TokenCancelListingListener;
