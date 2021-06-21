import Web3 from 'web3';

import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class MintToken extends Transaction {
  constructor(
    contract: string,
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
    }
  ) {
    const web3 = new Web3();
    const contract_ = new web3.eth.Contract(
      Contracts.Token.interface as any,
      contract
    );

    const txData = contract_.methods
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

    console.log('Contract addr: ' + contract);

    super(contract, txData);
  }
}

export default MintToken;
