import Web3 from 'web3';

import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenMintProps } from '../../../jobs/TokenMint';

export default async (web3: Web3, callback): Promise<void> => {
  const networkId = await web3.eth.net.getId();

  const contract = new web3.eth.Contract(
    Contracts.Token.interface as any,
    Contracts.Token.getAddress(networkId.toString())
  );

  contract.events.Minted().on('data', (event: any) => {
    const { transactionHash, address, returnValues } = event;

    console.log('ETH_EVENT: Minted.');

    const job: TokenMintProps = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: returnValues.id,
      data: returnValues.data
    };

    callback(job);
  });
};
