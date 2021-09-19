import React, { useEffect, useState } from 'react';

import { EthereumService } from '@fanbase/ethereum';
import { EthereumTx } from '@fanbase/shared';

import { Web3Context } from './Web3Provider';

export const useWeb3 = () => {
  const context = React.useContext(Web3Context);

  const [ethereum, setEthereum] = useState<EthereumService>();

  useEffect(() => {
    if (!context.web3) return;
    EthereumService.getInstance(context.web3).then((instance) =>
      setEthereum(instance)
    );
  }, [context.web3]);

  const sendTxAndAwaitConfirmation = async (tx: EthereumTx) => {
    return ethereum.sendTx(tx).then((hash: string) => {
      return context.awaitTxConfirmation(hash);
    });
  };

  return { ...context, ethereum, sendTxAndAwaitConfirmation };
};

export default useWeb3;
