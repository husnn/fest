import { Contracts } from '@fanbase/eth-contracts';
import { Protocol } from '@fanbase/shared';

import { TokenListForSaleProps } from '../../../jobs/TokenListForSale';

export default async (callback): Promise<void> => {
  const contract = Contracts.Market.get();

  contract.events.ListForSale().on('data', (event: any) => {
    const { transactionHash, address, returnValues } = event;

    console.log('List for sale...');
    console.log(returnValues);

    const {
      tradeId,
      seller,
      tokenContract,
      tokenId,
      quantity,
      currency,
      price
    } = returnValues;

    const job: TokenListForSaleProps = {
      protocol: Protocol.ETHEREUM,
      tx: transactionHash,
      contract: address,
      id: tradeId,
      seller,
      token: tokenContract,
      tokenId,
      quantity,
      currency,
      price
    };

    callback(job);
  });
};
