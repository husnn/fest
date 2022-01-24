import Contracts from '@fest/eth-contracts';

import Transaction from './Transaction';

export class WithdrawMarketEarnings extends Transaction {
  constructor(
    data: {
      currencyContract: string;
      amount: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .withdraw(data.currencyContract, data.amount)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default WithdrawMarketEarnings;
