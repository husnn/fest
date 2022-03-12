import { Protocol } from '@fest/shared';
import { TokenRoyaltyPaymentJob } from '../../jobs/TokenRoyaltyPayment';
import EventListener from './EventListener';

export class TokenRoyaltyPaymentListener extends EventListener<TokenRoyaltyPaymentJob> {
  EVENT_NAME = 'RoyaltyPayment';

  prepareJob(event: any): TokenRoyaltyPaymentJob {
    const { transactionHash, address, returnValues } = event;

    const { token, tokenId, receiver, currency, amount } = returnValues;

    const job: TokenRoyaltyPaymentJob = {
      protocol: Protocol.ETHEREUM,
      networkId: this.networkId,
      txHash: transactionHash,
      contract: address,
      token,
      tokenId,
      receiver,
      currency,
      amount
    };

    return job;
  }
}

export default TokenRoyaltyPaymentListener;
