import Contracts from '@fanbase/eth-contracts';
import Transaction from './Transaction';

export class CancelTokenListing extends Transaction {
  constructor(
    data: {
      listingId: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods.cancel(data.listingId).encodeABI();

    super(contract.options.address, txData);
  }
}

export default CancelTokenListing;
