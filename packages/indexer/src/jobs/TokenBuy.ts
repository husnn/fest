import { TokenTradeRepository } from '@fanbase/core';
import { Protocol, TokenTradeStatus } from '@fanbase/shared';

import Job from './Job';

export type TokenBuyJob = {
  protocol: Protocol;
  tx: string;
  contract: string;
  id: string;
  buyer: string;
  quantity: number;
};

export default class TokenBuy extends Job {
  private protocol: Protocol;
  private tx: string;
  private contract: string;
  private id: string;
  private buyer: string;
  private quantity: number;

  constructor(props: TokenBuyJob) {
    super();

    Object.assign(this, props);
  }

  async execute(tokenTradeRepository: TokenTradeRepository): Promise<void> {
    try {
      const trade = await tokenTradeRepository.findByChainData(this.protocol, {
        contract: this.contract,
        id: this.id
      });

      const available =
        this.quantity < trade.available ? trade.available - this.quantity : 0;

      if (available == 0) trade.status = TokenTradeStatus.Sold;

      await tokenTradeRepository.update(trade);
    } catch (err) {
      console.log(err);
    }
  }
}
