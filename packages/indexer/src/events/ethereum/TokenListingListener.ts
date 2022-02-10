import { Protocol } from '@fest/shared';
import { TokenListForSaleJob } from '../../jobs/TokenListForSale';
import EventListener from './EventListener';

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
      expiry,
      maxPerBuyer
    } = returnValues;

    const job: TokenListForSaleJob = {
      protocol: Protocol.ETHEREUM,
      networkId: this.networkId,
      txHash: transactionHash,
      contract: address,
      id: listingId,
      seller,
      token: tokenContract,
      tokenId,
      quantity,
      currency,
      priceAmount: price,
      expiry,
      maxPerBuyer
    };

    return job;
  }
}

export default TokenListingListener;
