import { Protocol } from '@fest/shared';
import { TokenBuyJob } from '../../jobs/TokenBuy';
import EventListener from './EventListener';

export class TokenBuyListener extends EventListener<TokenBuyJob> {
  EVENT_NAME = 'Trade';

  prepareJob(event: any): TokenBuyJob {
    const { transactionHash, address, returnValues } = event;

    const { listingId, buyer, quantity } = returnValues;

    const job: TokenBuyJob = {
      protocol: Protocol.ETHEREUM,
      networkId: this.networkId,
      txHash: transactionHash,
      contract: address,
      listingId,
      buyer,
      quantity
    };

    return job;
  }
}

export default TokenBuyListener;
