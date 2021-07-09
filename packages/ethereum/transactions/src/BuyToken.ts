import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class BuyToken extends Transaction {
  constructor(
    data: {
      tradeId: string;
      quantity: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Market.get(contractAddress);

    const txData = contract.methods
      .buy(data.tradeId, data.quantity)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default BuyToken;
