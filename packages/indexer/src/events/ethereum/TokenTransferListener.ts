import { Protocol } from '@fanbase/shared';

import { TokenTransferJob } from '../../jobs/TokenTransfer';
import EventListener from './EventListener';

export class TokenTransferListener extends EventListener<TokenTransferJob> {
  EVENT_NAME = 'TransferSingle';

  prepareJob(event: any): TokenTransferJob {
    const { address } = event;
    const { from, to, id, value } = event.returnValues;

    const job: TokenTransferJob = {
      protocol: Protocol.ETHEREUM,
      contract: address,
      from,
      to,
      id,
      quantity: parseInt(value)
    };

    return job;
  }
}

export default TokenTransferListener;