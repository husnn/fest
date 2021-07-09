import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class ApproveTokenMarket extends Transaction {
  constructor(contractAddress?: string) {
    const tokenContract = Contracts.Token.get(contractAddress);
    const marketContract = Contracts.MarketWallet.get(contractAddress);

    const txData = tokenContract.methods
      .setApprovalForAll(marketContract.options.address, true)
      .encodeABI();

    super(tokenContract.options.address, txData);
  }
}

export default ApproveTokenMarket;
