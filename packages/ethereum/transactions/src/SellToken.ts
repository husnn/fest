import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class SellToken extends Transaction {
  constructor(
    data: {
      seller: string;
      token: string;
      tokenId: string;
      quantity: number;
      currency: string;
      price: string;
      expiry: number;
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Market.get(contractAddress);

    const txData = contract.methods
      .sell(
        data.seller,
        data.token,
        data.tokenId,
        data.quantity,
        data.currency,
        data.price,
        data.expiry,
        data.salt,
        data.signature
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default SellToken;
