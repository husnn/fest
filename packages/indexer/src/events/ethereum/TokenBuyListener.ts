import { Protocol } from '@fanbase/shared';

import { TokenBuyJob } from '../../jobs/TokenBuy';
import EventListener from './EventListener';

export class TokenBuyListener extends EventListener<TokenBuyJob> {
  EVENT_NAME = 'Buy';

  prepareJob(event: any): TokenBuyJob {
    const { transactionHash, address, returnValues } = event;

    const { tradeId, buyer, quantity } = returnValues;

    const job: TokenBuyJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: tradeId,
      buyer,
      quantity
    };

    return job;
  }
}

export default TokenBuyListener;
