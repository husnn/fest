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
      expiry: number;
      maxPerBuyer: number;
      approval: {
        expiry: number;
        salt: string;
        signature: string;
      };
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
        data.expiry,
        data.maxPerBuyer,
        data.approval
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default ListTokenForSale;
