import Contracts from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class AcceptOffer extends Transaction {
  constructor(
    data: {
      offer: {
        buyer: string;
        seller: string;
        token: string;
        tokenId: string;
        quantity: number;
        currency: string;
        price: string;
        expiry: number;
      };
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .acceptOffer(data.offer, data.salt, data.signature)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default AcceptOffer;
