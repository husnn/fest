import EventListener from './EventListener';
import { Protocol } from '@fest/shared';
import { TokenBuyJob } from '../../jobs/TokenBuy';

export class TokenBuyListener extends EventListener<TokenBuyJob> {
  EVENT_NAME = 'Trade';

  prepareJob(event: any): TokenBuyJob {
    const { transactionHash, address, returnValues } = event;

    const { listingId, buyer, quantity } = returnValues;

    const job: TokenBuyJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      listingId,
      buyer,
      quantity
    };

    return job;
  }
}

export default TokenBuyListener;
