import Contracts from '@fest/eth-contracts';

import Transaction from './Transaction';

export class BuyToken extends Transaction {
  constructor(
    data: {
      listingId: string;
      quantity: number;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .buy(data.listingId, data.quantity)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default BuyToken;
