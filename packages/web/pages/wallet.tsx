import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import contracts from '@fanbase/eth-contracts';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

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

const WalletContainer = styled.div`
  margin: 20px 0;
`;

const BalanceContainer = styled.div`
  margin: 0 auto;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr;

  @media screen and (min-width: 500px) {
    grid-template-columns: 3fr 2fr;

    > * + * {
      margin-left: 20px;
    }
  }
`;

const CurrencySelection = styled.div`
  padding: 20px 10px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 2px 20px 10px rgba(0, 0, 0, 0.03);

  @media screen and (max-width: 500px) {
    margin-top: -20px;
    order: 1;
  }

  > * + * {
    margin-top: 5px;
  }
`;

const CurrencyTab = styled.div<{ selected: boolean }>`
  padding: 15px 30px;
  background: ${(props) => props.selected && '#f5f5f5'};
  font-weight: ${(props) => props.selected && 'bold'};
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const Balance = styled.div`
  padding: 50px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 30px;

  @media screen and (max-width: 500px) {
    width: 95%;
    margin: 0 auto;
    border-radius: 30px 30px 0 0;
  }

  h1 {
    word-break: break-word;
  }

  > * + * {
    margin-top: 5px;
  }
`;

const BalanceActions = styled.div`
  width: 200px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;

  > * + * {
    margin-left: 10px;
  }
`;

const TransactionContainer = styled.div`
  margin: 30px 0;
`;

type Currency = {
  name: string;
  symbol: string;
  balance?: string;
};

export const WalletPage = () => {
  const { currentUser } = useAuthentication();

  const [currencies] = useState<Currency[]>([
    {
      name: 'Ether',
      symbol: 'ETH'
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

  const [currencySelected, setCurrencySelected] = useState<Currency>();

  const getBalance = async (currency: Currency) => {
    switch (currency.symbol) {
      case 'ETH':
        return await EthereumClient.instance?.getEtherBalance(
          currentUser?.wallet.address
        );
      case 'DAI':
        return await EthereumClient.instance?.getERC20Balance(
          process.env.ETH_CONTRACT_DAI_ADDRESS,
          currentUser?.wallet.address
        );
      case 'FAN':
        return await EthereumClient.instance?.getERC20Balance(
          contracts.Contracts.FAN.get().options.address,
          currentUser?.wallet.address
        );
    }
  };

  const selectCurrency = async (currency: Currency) => {
    const balance = await getBalance(currency);
    currency.balance = balance && parseFloat(balance).toFixed(5);
    setCurrencySelected(currency);
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

  useEffect(() => {
    if (currentUser) selectCurrency(currencies[0]);
  }, [currentUser]);

  return (
    <div className="boxed">
      <Head>
        <title>Wallet</title>
      </Head>
      <h1>Your wallet</h1>
      <p style={{ marginTop: 10 }}>
        See your balances and most recent transactions.
      </p>
      <WalletInfo>
        <p style={{ textTransform: 'capitalize' }}>
          {currentUser?.wallet.type.toLowerCase()}
        </p>
        <p
          style={{
            marginTop: 10,
            wordBreak: 'break-all',
            fontWeight: 'bold'
          }}
        >
          {currentUser?.wallet.address}
        </p>
      </WalletInfo>
      <WalletContainer>
        <BalanceContainer>
          <CurrencySelection>
            {currencies?.map((currency: Currency, index: number) => (
              <CurrencyTab
                key={index}
                selected={currency.symbol == currencySelected?.symbol}
                onClick={() => selectCurrency(currency)}
              >
                <p>
                  {currency.name} - {currency.symbol}
                </p>
              </CurrencyTab>
            ))}
          </CurrencySelection>
          {currencySelected && (
            <Balance>
              <p>Your balance</p>
              <h1>{currencySelected.balance || '0.00'}</h1>
              <p>{currencySelected.symbol}</p>
              <BalanceActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => sendFunds()}
                >
                  Send
                </Button>
                <Button size="small" color="primary" onClick={() => addFunds()}>
                  Add
                </Button>
              </BalanceActions>
            </Balance>
          )}
        </BalanceContainer>
      </WalletContainer>
      {/* <TransactionContainer>
        <h2>Recent transactions</h2>
      </TransactionContainer> */}
    </div>
  );
};

export default WalletPage;
