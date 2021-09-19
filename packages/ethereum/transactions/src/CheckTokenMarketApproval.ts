import Contracts from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class CheckTokenMarketApproval extends Transaction {
  constructor(
    data: {
      owner: string;
    },
    contractAddress?: string
  ) {
    const tokenContract = Contracts.get('Token', contractAddress);
    const walletContract = Contracts.get('MarketWallet', contractAddress);

    const txData = tokenContract.methods
      .isApprovedForAll(data.owner, walletContract.options.address)
      .encodeABI();

    super(tokenContract.options.address, txData);
  }
}

export default CheckTokenMarketApproval;
