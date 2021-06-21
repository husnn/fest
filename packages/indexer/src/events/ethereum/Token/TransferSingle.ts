import Web3 from 'web3';

import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenTransferProps } from '../../../jobs/TokenTransfer';

export default async (web3: Web3, callback): Promise<void> => {
  const networkId = await web3.eth.net.getId();

  const contract = new web3.eth.Contract(
    Contracts.Token.interface as any,
    Contracts.Token.getAddress(networkId.toString())
  );

  contract.events.TransferSingle().on('data', (event: any) => {
    const { address } = event;
    const { from, to, id, value } = event.returnValues;

    if (from == (Web3.utils.toBN(0) || to)) return;

    const job: TokenTransferProps = {
      protocol: Protocol.ETHEREUM,
      contract: address,
      from,
      to,
      id,
      quantity: parseInt(value)
    };

    callback(job);
  });
};
