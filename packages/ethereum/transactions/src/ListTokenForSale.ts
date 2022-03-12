import Contracts from '@fest/eth-contracts';
import { MarketFees } from '@fest/shared';
import Transaction from './Transaction';

export class ListTokenForSale extends Transaction {
  constructor(
    data: {
      seller: string;
      token: string;
      tokenId: string;
      quantity: number;
      currency: string;
      price: string;
      fees: MarketFees;
      maxPerBuyer: number;
      expiry: number;
      approval: {
        nonce: string;
        expiry: number;
        signature: string;
      };
    },
    contractAddress?: string
  ) {
    const contract = Contracts.get('Market', contractAddress);

    const txData = contract.methods
      .listForSale(
        data.seller,
        data.token,
        data.tokenId,
        data.quantity,
        data.currency,
        data.price,
        data.fees,
        data.maxPerBuyer,
        data.expiry,
        data.approval
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default ListTokenForSale;
