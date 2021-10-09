import React, { useEffect, useState } from 'react';
import { getNativeToken, isProduction } from '../utils';

import { ApiClient } from '../modules/api';
import { Balance } from '@fanbase/shared';
import BalanceView from '../ui/BalanceView';
import { Button } from '../ui';
import { CurrencyBalance } from '../types';
import Head from 'next/head';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useWeb3 } from '../modules/web3';

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

  const web3 = useWeb3(true);

  const [addingFunds, setAddingFunds] = useState(false);

  const sendFunds = () => {
    return;
  };

  const addFunds = async () => {
    if (!isProduction && selectedCurrencyBalance.currency.symbol === 'FAN') {
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

    let swapAssetPrefix: string;

    switch (web3.config.chainId) {
      case 137:
      case 80001:
        if (selectedCurrencyBalance.currency.symbol !== 'MATIC')
          swapAssetPrefix = 'MATIC_';
        break;
    }

    new RampInstantSDK({
      hostAppName: 'Fanbase',
      hostLogoUrl: 'https://docs.ramp.network/img/logo-1.svg',
      ...(!isProduction && {
        url: 'https://ri-widget-staging.firebaseapp.com'
      }),
      userAddress: currentUser.wallet.address,
      userEmailAddress: currentUser.email,
      swapAsset: `${swapAssetPrefix ? swapAssetPrefix : ''}${
        selectedCurrencyBalance.currency.symbol
      }`
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
        currency: getNativeToken(),
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

    if (balance.currency.symbol === getNativeToken().symbol) {
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
    <div className="container boxed">
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
          {/* <Button size="small" color="secondary" onClick={() => sendFunds()}>
            Send
          </Button> */}
          <Button
            size="small"
            color="primary"
            onClick={() => addFunds()}
            disabled={addingFunds}
          >
            Add funds
          </Button>
        </React.Fragment>
      </BalanceView>
    </div>
  ) : null;
};

export default WalletPage;
