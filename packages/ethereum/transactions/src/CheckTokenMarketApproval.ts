import { Contracts } from '@fanbase/eth-contracts';

import Transaction from './Transaction';

export class CheckTokenMarketApproval extends Transaction {
  constructor(
    data: {
      owner: string;
    },
    contractAddress?: string
  ) {
    const tokenContract = Contracts.Token.get(contractAddress);
    const walletContract = Contracts.MarketWallet.get(contractAddress);

    const txData = tokenContract.methods
      .isApprovedForAll(data.owner, walletContract.options.address)
      .encodeABI();

    super(tokenContract.options.address, txData);
  }
}

export default CheckTokenMarketApproval;
