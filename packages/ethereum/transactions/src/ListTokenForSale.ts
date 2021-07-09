import Web3 from 'web3';

import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class ListTokenForSale extends Transaction {
  constructor(
    data: {
      seller: string;
      tokenContract: string;
      tokenId: string;
      quantity: number;
      currencyContract: string;
      price: number;
      expiry: number;
      salt: string;
      signature: string;
    },
    contractAddress?: string
  ) {
    const contract = Contracts.Market.get(contractAddress);

    const txData = contract.methods
      .listForSale(
        data.seller,
        data.tokenContract,
        data.tokenId,
        data.quantity,
        data.currencyContract,
        Web3.utils.toWei(data.price.toString()),
        data.expiry,
        data.salt,
        data.signature
      )
      .encodeABI();

    super(contract.options.address, txData);
  }
}

export default ListTokenForSale;
