import { Protocol } from '@fanbase/shared';

import { TokenCancelListingJob } from '../../jobs/TokenCancelListing';
import EventListener from './EventListener';

export class TokenCancelListingListener extends EventListener<TokenCancelListingJob> {
  EVENT_NAME = 'CancelListing';

  prepareJob(event: any): TokenCancelListingJob {
    const { address, returnValues } = event;

    const { operator, tradeId } = returnValues;

    const job: TokenCancelListingJob = {
      protocol: Protocol.ETHEREUM,
      contract: address,
      tradeId,
      canceller: operator
    };

    return job;
  }
}

export default TokenCancelListingListener;
