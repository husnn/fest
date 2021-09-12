import { Protocol } from '@fanbase/shared';

import { TokenListForSaleJob } from '../../jobs/TokenListForSale';
import EventListener from './EventListener';

export class TokenListingListener extends EventListener<TokenListForSaleJob> {
  EVENT_NAME = 'ListForSale';

  prepareJob(event: any): TokenListForSaleJob {
    const { transactionHash, address, returnValues } = event;

    const {
      tradeId,
      seller,
      tokenContract,
      tokenId,
      quantity,
      currency,
      price
    } = returnValues;

    const job: TokenListForSaleJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: tradeId,
      seller,
      token: tokenContract,
      tokenId,
      quantity,
      currency,
      priceAmount: price
    };

    return job;
  }
}

export default TokenListingListener;
