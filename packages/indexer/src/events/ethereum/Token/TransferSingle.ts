import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenTransferProps } from '../../../jobs/TokenTransfer';

export default async (callback): Promise<void> => {
  const contract = Contracts.Token.get();

  contract.events.TransferSingle().on('data', (event: any) => {
    const { address } = event;
    const { from, to, id, value } = event.returnValues;

    if (from == ('0x0000000000000000000000000000000000000000' || to)) return;

    console.log('Transferred');

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
