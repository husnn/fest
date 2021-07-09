import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class TransferToken extends Transaction {
  constructor(
    data: {
      from: string;
      to: string;
      id: string;
      quantity: number;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Token.get(contractAddress);

    const txData = contract.methods
      .safeTransferFrom(data.from, data.to, data.id, data.quantity, [])
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default TransferToken;
