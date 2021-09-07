import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class WithdrawMarketEarnings extends Transaction {
  constructor(
    data: {
      currencyContract: string;
      amount: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Market.get(contractAddress);

    const txData = contract.methods
      .withdraw(data.currencyContract, data.amount)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default WithdrawMarketEarnings;
