import { Protocol } from '@fanbase/shared';

import Job from './Job';

export type TokenRoyaltyPaymentJob = {
  protocol: Protocol;
  tx: string;
  contract: string;
  token: string;
  tokenId: string;
  beneficiary: string;
  currency: string;
  amount: string;
};

export class TokenRoyaltyPayment extends Job<TokenRoyaltyPaymentJob> {
  constructor(props: TokenRoyaltyPaymentJob) {
    super(props);
  }

  async execute(): Promise<void> {
    console.log(
      `Royalty payment to ${this.props.beneficiary}
			of ${this.props.amount} for token ${this.props.token}`
    );
  }
}

export default TokenRoyaltyPayment;
