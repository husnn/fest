import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class MintToken extends Transaction {
  constructor(
    data: {
      creator: string;
      supply: number;
      fees: Array<[string, number]>;
      data: string;
      expiry: number;
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Token.get(contractAddress);

    const fees = data.fees.map((x) => {
      const [recipient, pct] = x;
      return { recipient, pct };
    });

    const txData = contract.methods
      .mint(
        data.creator,
        data.supply,
        fees,
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
