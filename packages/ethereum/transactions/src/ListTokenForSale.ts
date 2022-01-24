import Contracts from '@fest/eth-contracts';
import Transaction from './Transaction';

export class ListTokenForSale extends Transaction {
  constructor(
    data: {
      seller: string;
      tokenContract: string;
      tokenId: string;
      quantity: number;
      currency: string;
      price: string;
      maxPurchasable: number;
      expiry: number;
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .listForSale(
        data.seller,
        data.tokenContract,
        data.tokenId,
        data.quantity,
        data.currency,
        data.price,
        data.maxPurchasable,
        data.expiry,
        data.salt,
        data.signature
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default ListTokenForSale;
