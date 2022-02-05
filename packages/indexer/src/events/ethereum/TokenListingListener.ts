import EventListener from './EventListener';
import { Protocol } from '@fest/shared';
import { TokenListForSaleJob } from '../../jobs/TokenListForSale';

export class TokenListingListener extends EventListener<TokenListForSaleJob> {
  EVENT_NAME = 'ListForSale';

  prepareJob(event: any): TokenListForSaleJob {
    const { transactionHash, address, returnValues } = event;

    const {
      listingId,
      seller,
      tokenContract,
      tokenId,
      quantity,
      currency,
      price,
      maxPurchasable,
      expiry
    } = returnValues;

    const job: TokenListForSaleJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: listingId,
      seller,
      token: tokenContract,
      tokenId,
      quantity,
      currency,
      priceAmount: price,
      maxPurchasable,
      expiry
    };

    return job;
  }
}

export default TokenListingListener;
