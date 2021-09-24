import EventListener from './EventListener';
import { TokenRoyaltyPaymentJob } from '../../jobs/TokenRoyaltyPayment';
import { Protocol } from '@fanbase/shared';

export class TokenRoyaltyPaymentListener extends EventListener<TokenRoyaltyPaymentJob> {
  EVENT_NAME = 'RoyaltyPayment';

  prepareJob(event: any): TokenRoyaltyPaymentJob {
    const { transactionHash, address, returnValues } = event;

    const { token, tokenId, beneficiary, currency, amount } = returnValues;

    const job: TokenRoyaltyPaymentJob = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      token,
      tokenId,
      beneficiary,
      currency,
      amount
    };

    return job;
  }
}

export default TokenRoyaltyPaymentListener;
