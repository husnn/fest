import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class MintToken extends Transaction {
  constructor(
    data: {
      creator: string;
      supply: number;
      fees: Array<{
        recipient: string;
        pct: string;
      }>;
      data: string;
      expiry: number;
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Token.get(contractAddress);

    const txData = contract.methods
      .mint(
        data.creator,
        data.supply,
        data.fees,
        data.data,
        data.expiry,
        data.salt,
        data.signature
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default MintToken;
