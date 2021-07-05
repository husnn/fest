import React, { useEffect, useState } from 'react';

import EthereumClient from './EthereumClient';

const useEthereum = () => {
  const [ethInstance, setEthInstance] = useState<EthereumClient>();

  useEffect(() => {
    let eth = EthereumClient.instance;

    if (!eth) {
      eth = new EthereumClient();
    }

    setEthInstance(eth);
  }, []);

  return ethInstance;
};

export default useEthereum;
