import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenMintProps } from '../../../jobs/TokenMint';

export default async (callback, block?: string): Promise<void> => {
  const contract = Contracts.Token.get();

  contract.events
    .Minted(
      {},
      {
        fromBlock: block + 1 || 'latest'
      }
    )
    .on('data', (event: any) => {
      const { transactionHash, address, returnValues, blockNumber } = event;

      const job: TokenMintProps = {
        protocol: Protocol.ETHEREUM,
        tx: transactionHash,
        contract: address,
        id: returnValues.id,
        creator: returnValues.token.creator,
        supply: returnValues.token.supply,
        data: returnValues.data
      };

      callback(job, blockNumber);
    });
};
