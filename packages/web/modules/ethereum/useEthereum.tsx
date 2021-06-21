import React, { useEffect, useState } from 'react';

import EthereumClient from './EthereumClient';

const useEthereum = () => {
  const [account, setAccount] = useState<string>();
  let eth: EthereumClient;

  const updateAccount = async () => {
    const coinbase = await eth.getAddress();
    setAccount(coinbase);
  };

  useEffect(() => {
    eth = EthereumClient.instance;

    if (!eth) {
      eth = new EthereumClient();
    }

    updateAccount();
  }, []);

  return { account };
};

export default useEthereum;
