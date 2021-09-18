/* eslint-disable @typescript-eslint/no-explicit-any */
import Fortmatic from 'fortmatic';
import React, { useEffect, useRef, useState } from 'react';
import Web3 from 'web3';

import Contracts from '@fanbase/eth-contracts';
import { WalletType } from '@fanbase/shared';

import { getCurrentUser } from '../auth/authStorage';
import useAuthentication from '../auth/useAuthentication';

type Wallet = {
  type: WalletType;
  address: string;
};

export type Web3ContextProps = {
  web3: Web3;
  wallet: Wallet;
  chainId: number;
  requestSignature: (msg: string, address: string) => Promise<string>;
  awaitTxConfirmation: (hash: string) => Promise<void>;
};

export const Web3Context = React.createContext<Web3ContextProps>(null);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { clearAuth } = useAuthentication();

  const initialMount = useRef(true);

  const [wallet, setWallet] = useState<{
    type: WalletType;
    address: string;
  }>(undefined);

  const [web3, setWeb3] = useState<Web3>();

  const rpcUrl =
    process.env.NEXT_PUBLIC_ETH_PROVIDER || 'http://localhost:8545';

  const [chainId, setChainId] = useState<number>();

  const [networkId, setNetworkId] = useState<number>();

  useEffect(() => {
    if (!initialMount.current) return; // Skip if not browser or initial load

    initWeb3();

    initialMount.current = false;
  });

  const requiredChainId = process.env.NEXT_PUBLIC_ETH_CHAIN;
  const requiredNetworkId = process.env.NEXT_PUBLIC_ETH_NETWORK;

  useEffect(() => {
    if (!chainId || !networkId || !requiredChainId || !requiredNetworkId)
      return;

    if (chainId !== parseInt(requiredChainId)) {
      console.log(`You're on the wrong chain.`);
    }

    if (networkId !== parseInt(requiredNetworkId)) {
      console.log(`You're on the wrong network.`);
    }
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

    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.wallet.type == WalletType.EXTERNAL) {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // MetaMask available
        provider = window.ethereum;

        provider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0)
            setWallet({
              type: WalletType.EXTERNAL,
              address: accounts[0]
            });
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

      let accounts: string[];

      try {
        accounts = await provider.request({ method: 'eth_requestAccounts' });
      } catch (err) {
        console.log(`Could not connect to MetaMask. ${err}`);
        return;
      }

      const selectedAccount = accounts[0];

      setWallet({
        type: WalletType.EXTERNAL,
        address: selectedAccount
      });
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

    await Contracts.init(web3);

    setWeb3(web3);
  };

  const requestSignature = (msg: string) =>
    web3.eth.personal.sign(msg, wallet.address, '');

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
        web3,
        wallet,
        chainId,
        requestSignature,
        awaitTxConfirmation
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
