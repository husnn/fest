import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenBuyProps } from '../../../jobs/TokenBuy';

export default async (callback): Promise<void> => {
  const contract = Contracts.Market.get();

  contract.events.Buy().on('data', (event: any) => {
    const { transactionHash, address, returnValues } = event;

    const { tradeId, buyer, quantity } = returnValues;

    const job: TokenBuyProps = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: tradeId,
      buyer,
      quantity
    };

    callback(job);
  });
};
