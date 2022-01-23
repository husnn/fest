import React, { useEffect, useState } from 'react';
import { getNativeToken, isProduction } from '../utils';

import { ApiClient } from '../modules/api';
import { Balance } from '@fanbase/shared';
import BalanceView from '../ui/BalanceView';
import { Button } from '../ui';
import { CurrencyBalance } from '../types';
import Head from 'next/head';
import styled from '@emotion/styled';
import transakSDK from '@transak/transak-sdk';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useWeb3 } from '../modules/web3';

const WalletInfo = styled.div`
  margin: 20px 0;
  padding: 20px;
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
    if (!isProduction && selectedCurrencyBalance.currency.symbol === 'FEST') {
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

    let network = 'ethereum';

    switch (web3.config.chainId) {
      case 137:
      case 80001:
        network = 'polygon';
        break;
    }

    new transakSDK({
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY,
      environment: isProduction ? 'PRODUCTION' : 'STAGING',
      networks: network,
      cryptoCurrencyCode: selectedCurrencyBalance.currency.symbol,
      walletAddress: currentUser.wallet.address,
      themeColor: '000000',
      email: currentUser.email,
      redirectURL: '',
      hostURL: window.location.origin
    }).init();
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
      <p>See your balances and most recent transactions.</p>
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
