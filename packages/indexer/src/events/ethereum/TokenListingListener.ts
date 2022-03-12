import { Protocol } from '@fest/shared';
import { TokenListForSaleJob } from '../../jobs/TokenListForSale';
import EventListener from './EventListener';

export class TokenListingListener extends EventListener<TokenListForSaleJob> {
  EVENT_NAME = 'ListToken';

  prepareJob(event: any): TokenListForSaleJob {
    const { transactionHash, address, returnValues } = event;

    const {
      listingId,
      seller,
      token,
      tokenId,
      quantity,
      currency,
      price,
      maxPerBuyer,
      expiry
    } = returnValues;

    const job: TokenListForSaleJob = {
      protocol: Protocol.ETHEREUM,
      networkId: this.networkId,
      txHash: transactionHash,
      contract: address,
      id: listingId,
      seller,
      token,
      tokenId,
      quantity,
      currency,
      priceAmount: price,
      maxPerBuyer,
      expiry
    };

    return job;
  }
}

export default TokenListingListener;
