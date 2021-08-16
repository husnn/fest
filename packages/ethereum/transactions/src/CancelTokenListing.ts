import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class CancelTokenListing extends Transaction {
  constructor(
    data: {
      tradeId: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Market.get(contractAddress);

    const txData = contract.methods.cancel(data.tradeId).encodeABI();

    super(contract.options.address, txData);
  }
}

export default CancelTokenListing;
