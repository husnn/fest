import Contracts from '@fest/eth-contracts';

import Transaction from './Transaction';

export class ApproveTokenMarket extends Transaction {
  constructor(contractAddress?: string) {
    const tokenContract = Contracts.get('Token', contractAddress);
    const marketContract = Contracts.get('MarketWallet', contractAddress);

    const txData = tokenContract.methods
      .setApprovalForAll(marketContract.options.address, true) // TODO
      .encodeABI();

    super(tokenContract.options.address, txData);
  }
}

export default ApproveTokenMarket;
