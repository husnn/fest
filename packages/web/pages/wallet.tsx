import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import contracts from '@fanbase/eth-contracts';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

import Wallet, { WalletCurrency } from '../components/Wallet';
// import TransakSDK from '@transak/transak-sdk';
import useAuthentication from '../modules/auth/useAuthentication';
import EthereumClient from '../modules/ethereum/EthereumClient';
import { Button } from '../ui';

const WalletInfo = styled.div`
  margin: 20px 0;
  padding: 20px;
  // background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 20px;
`;

export const WalletPage = () => {
  const { currentUser } = useAuthentication(true);

  const [currencies] = useState<WalletCurrency[]>([
    {
      name: 'Ether',
      symbol: 'ETH',
      precision: 5
    },
    {
      name: 'Dai',
      symbol: 'DAI'
    },
    {
      name: 'Fan Coin',
      symbol: 'FAN'
    }
  ]);

  const getBalance = async (currency: WalletCurrency) => {
    switch (currency.symbol) {
      case 'ETH':
        return await EthereumClient.instance?.getEtherBalance(
          currentUser.wallet.address
        );
      case 'DAI':
        return await EthereumClient.instance?.getERC20Balance(
          process.env.ETH_CONTRACT_DAI_ADDRESS,
          currentUser.wallet.address
        );
      case 'FAN':
        return await EthereumClient.instance?.getERC20Balance(
          contracts.Contracts.FAN.get().options.address,
          currentUser.wallet.address
        );
    }
  };

  const sendFunds = () => {
    return;
  };

  const addFunds = () => {
    // const transak = new TransakSDK({
    //   apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY,
    //   environment: 'STAGING',
    //   cryptoCurrencyList: 'DAI',
    //   defaultCryptoCurrency: 'DAI',
    //   cryptoCurrencyCode: 'DAI',
    //   networks: 'MATIC',
    //   defaultNetwork: 'MATIC',
    //   walletAddress: currentUser?.wallet.address,
    //   defaultFiatAmount: 100,
    //   fiatAmount: 100,
    //   defaultCryptoAmount: 100,
    //   email: currentUser?.email,
    //   hostURL: window.location.origin,
    //   widgetHeight: '550px',
    //   widgetWidth: '450px'
    // });

    // transak.init();

    new RampInstantSDK({
      hostAppName: 'Maker DAO',
      hostLogoUrl:
        'https://cdn-images-1.medium.com/max/2600/1*nqtMwugX7TtpcS-5c3lRjw.png',
      userAddress: currentUser.wallet.address,
      userEmailAddress: currentUser.email,
      defaultAsset: 'MATIC_DAI',
      variant: 'mobile',
      url: 'https://ri-widget-staging-ropsten.firebaseapp.com/'
    }).show();
  };

  return currentUser ? (
    <div className="boxed">
      <Head>
        <title>Wallet</title>
      </Head>
      <h1>Your wallet</h1>
      <p style={{ marginTop: 10 }}>
        See your balances and most recent transactions.
      </p>
      <WalletInfo>
        <p
          style={{
            wordBreak: 'break-all',
            fontWeight: 'bold'
          }}
        >
          {currentUser.wallet.address}
        </p>
      </WalletInfo>
      <Wallet
        currencies={currencies}
        onCurrencySelected={async (currency: WalletCurrency, callback) => {
          const balance = await getBalance(currency);
          callback(balance);
        }}
      >
        <React.Fragment>
          <Button size="small" color="secondary" onClick={() => sendFunds()}>
            Send
          </Button>
          <Button size="small" color="primary" onClick={() => addFunds()}>
            Add
          </Button>
        </React.Fragment>
      </Wallet>
    </div>
  ) : null;
};

export default WalletPage;
