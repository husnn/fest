import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { Balance } from '@fanbase/shared';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

import BalanceView from '../components/BalanceView';
// import TransakSDK from '@transak/transak-sdk';
import useAuthentication from '../modules/auth/useAuthentication';
import { useWeb3 } from '../modules/web3';
import { CurrencyBalance } from '../types';
import { Button } from '../ui';
import { getNativeCurrency, isProduction } from '../utils';
import { useHeader } from '../modules/navigation';
import { ApiClient } from '../modules/api';

const WalletInfo = styled.div`
  margin: 20px 0;
  padding: 20px;
  // background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 20px;
`;

export const WalletPage = () => {
  useHeader();

  const { currentUser } = useAuthentication(true);

  const web3 = useWeb3();

  const [addingFunds, setAddingFunds] = useState(false);

  const sendFunds = () => {
    return;
  };

  const addFunds = async () => {
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

    if (!isProduction) {
      setAddingFunds(true);
      try {
        const result = await ApiClient.getInstance().requestTestFunds(
          selectedCurrencyBalance.currency.contract
        );
        await web3.awaitTxConfirmation(result.txHash);
        updateBalance(selectedCurrencyBalance);
      } catch (err) {
        console.log(err);
      }
      setAddingFunds(false);
      return;
    }

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

  const [currencyBalances, setCurrencyBalances] = useState<CurrencyBalance[]>(
    []
  );

  const [selectedCurrencyBalance, setSelectedCurrencyBalance] =
    useState<CurrencyBalance>();

  useEffect(() => {
    if (!web3.ethereum) return;

    const balances: CurrencyBalance[] = [
      {
        currency: getNativeCurrency(),
        balance: Balance(0),
        precision: 5
      },
      ...web3.config.currencies.map((currency, index: number) => {
        const balance: CurrencyBalance = {
          currency,
          balance: Balance(0),
          precision: 3,
          selected: index == 0
        };

        if (index == 0) setSelectedCurrencyBalance(balance);

        return balance;
      })
    ];

    setCurrencyBalances(balances);
  }, [web3.ethereum]);

  const updateBalance = async (balance: CurrencyBalance) => {
    let bal: string;

    if (balance.currency.symbol === getNativeCurrency().symbol) {
      bal = await web3.ethereum.getEtherBalance(currentUser.wallet.address);
    } else {
      bal = await web3.ethereum.getERC20Balance(
        balance.currency.contract,
        currentUser.wallet.address
      );
    }

    currencyBalances.map((element: CurrencyBalance) => {
      element.selected = false;

      if (element.currency.symbol === balance.currency.symbol) {
        element.balance.set(bal);
        element.selected = true;

        setSelectedCurrencyBalance(element);
      }

      return element;
    });

    setCurrencyBalances([...currencyBalances]);
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
      <BalanceView
        balances={currencyBalances}
        onSelect={(currency: CurrencyBalance) => updateBalance(currency)}
      >
        <React.Fragment>
          <Button size="small" color="secondary" onClick={() => sendFunds()}>
            Send
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() => addFunds()}
            disabled={addingFunds}
          >
            Add
          </Button>
        </React.Fragment>
      </BalanceView>
    </div>
  ) : null;
};

export default WalletPage;
