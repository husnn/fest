/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProtocolConfig, WalletType } from '@fest/shared';
import React, { useEffect, useRef, useState } from 'react';

import Alertbox from '../../ui/Alertbox';
import Contracts from '@fest/eth-contracts';
import Fortmatic from 'fortmatic';
import Web3 from 'web3';
import { fetchInitConfig } from '../../config';
import { getCurrentUser } from '../auth/authStorage';
import useAuthentication from '../auth/useAuthentication';

type Wallet = {
  type: WalletType;
  address: string;
};

export type Web3ContextProps = {
  init: () => Promise<void>;
  activate: () => Promise<string>;
  web3: Web3;
  config: ProtocolConfig;
  wallet: Wallet;
  chainId: number;
  requestSignature: (msg: string, address: string) => Promise<string>;
  awaitTxConfirmation: (hash: string) => Promise<void>;
};

export const Web3Context = React.createContext<Web3ContextProps>(null);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { clearAuth } = useAuthentication();

  const [wallet, setWallet] = useState<{
    type: WalletType;
    address: string;
  }>(undefined);

  const [web3, setWeb3] = useState<Web3>();

  const rpcUrl =
    process.env.NEXT_PUBLIC_ETH_PROVIDER || 'http://localhost:8545';

  const [config, setConfig] = useState<ProtocolConfig>();

  const [chainId, setChainId] = useState<number>();

  const [networkId, setNetworkId] = useState<number>();

  const [isMetaMask, setIsMetaMask] = useState(false);

  const initialMount = useRef(true);

  const [isWrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    if (!initialMount.current) return; // Skip if not browser or initial load

    initWeb3();

    initialMount.current = false;
  }, []);

  useEffect(() => {
    if (!chainId || !networkId || !config.chainId || !config.networkId) return;

    let isWrongNetwork = false;

    if (chainId !== config.chainId) {
      isWrongNetwork = true;
    } else if (networkId !== config.networkId) {
      isWrongNetwork = true;
    }

    setWrongNetwork(isWrongNetwork);
  }, [chainId, networkId]);

  useEffect(() => {
    if (!wallet) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (currentUser.wallet.address !== wallet.address) {
      clearAuth();
      return;
    }
  }, [wallet]);

  const initWeb3 = async () => {
    let provider;

    const ethereumConfig: ProtocolConfig = await fetchInitConfig()
      .then((config) => {
        return config.protocols['ETHEREUM'];
      })
      .catch(() => {
        throw new Error('Could not get config.');
      });

    setConfig(ethereumConfig);

    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.wallet.type == WalletType.EXTERNAL) {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // MetaMask available
        provider = window.ethereum;

        setIsMetaMask(true);

        provider.on('chainChanged', function (id: number) {
          window.location.reload();
        });
      } else {
        // MetaMask NOT available
        // User does NOT use our custodial wallet

        // Setup Fortmatic
        const fm = new Fortmatic(process.env.NEXT_PUBLIC_FORTMATIC_API_KEY, {
          rpcUrl,
          chainId
        });

        provider = fm.getProvider();
      }
    } else {
      // User has custodial wallet
      provider = new Web3.providers.HttpProvider(rpcUrl);

      setWallet({
        type: WalletType.INTERNAL,
        address: currentUser.wallet.address
      });
    }

    const web3 = new Web3(provider);

    const chain = await web3.eth.getChainId();
    const network = await web3.eth.net.getId();

    setChainId(chain);
    setNetworkId(network);

    if (chain === ethereumConfig.chainId) {
      await Contracts.init(web3);
      setWeb3(web3);
    }
  };

  const activate = async (): Promise<string> => {
    const currentUser = getCurrentUser();

    if (
      !web3 ||
      (currentUser && currentUser?.wallet.type == WalletType.INTERNAL)
    )
      return;

    let accounts: string[];

    try {
      if (isMetaMask) {
        accounts = await web3.givenProvider.request({
          method: 'eth_requestAccounts'
        });

        web3.givenProvider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0)
            setWallet({
              type: WalletType.EXTERNAL,
              address: accounts[0]
            });
        });
      } else {
        accounts = await web3.eth.getAccounts();
      }
    } catch (err) {
      console.log(`Could not connect to MetaMask. ${err}`);
      return;
    }

    const selectedAccount = accounts[0];

    setWallet({
      type: WalletType.EXTERNAL,
      address: selectedAccount
    });

    return selectedAccount;
  };

  const requestSignature = (msg: string, address: string) =>
    web3.eth.personal.sign(msg, address, '');

  const awaitTxConfirmation = (hash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        web3.eth.getTransactionReceipt(hash, (err, receipt) => {
          console.log(receipt);

          if (err) {
            clearInterval(interval);
            reject();
          }

          if (receipt) {
            clearInterval(interval);
            resolve();
          }
        });
      }, 5000);
    });
  };

  return (
    <Web3Context.Provider
      value={{
        init: initWeb3,
        activate,
        web3,
        config,
        wallet,
        chainId,
        requestSignature,
        awaitTxConfirmation
      }}
    >
      <Alertbox
        show={isWrongNetwork}
        title="You're on the wrong network."
        description={`Switch your MetaMask network to ${config?.chainId}.`}
      />
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
