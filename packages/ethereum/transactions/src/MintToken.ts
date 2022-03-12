import Contracts from '@fest/eth-contracts';
import Transaction from './Transaction';

export class MintToken extends Transaction {
  constructor(
    data: {
      creator: string;
      supply: number;
      uri: string;
      royaltyPct: number;
      data: string;
      nonce: string;
      expiry: number;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Token', contractAddress);

    const txData = contract.methods
      .mint(
        data.creator,
        data.supply,
        data.uri,
        data.royaltyPct,
        data.data,
        data.nonce,
        data.expiry,
        data.signature
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default MintToken;
