import { Protocol } from '@fanbase/shared';

import { TokenMintJob } from '../../jobs/TokenMint';
import EventListener from './EventListener';

export class TokenMintListener extends EventListener<TokenMintJob> {
  EVENT_NAME = 'Minted';

  prepareJob(event: any): TokenMintJob {
    const { transactionHash, address, returnValues } = event;

    const job: TokenMintJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: returnValues.id,
      creator: returnValues.token.creator,
      supply: returnValues.token.supply,
      data: returnValues.data
    };

    return job;
  }
}

export default TokenMintListener;
