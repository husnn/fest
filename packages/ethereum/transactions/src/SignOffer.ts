import Contracts from '@fest/eth-contracts';

import Transaction from './Transaction';

export class SignOffer extends Transaction {
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
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .getOfferHash(data.offer, data.salt)
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default SignOffer;
