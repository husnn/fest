import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';

const WalletContainer = styled.div`
  margin: 20px 0;
`;

const BalanceContainer = styled.div`
  margin: 0 auto;
  display: grid;
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
    width: 100%;
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

export type WalletCurrency = {
  name: string;
  symbol: string;
  precision?: number;
};

type WalletProps = {
  currencies: WalletCurrency[];
  onCurrencySelected: (
    currency: WalletCurrency,
    callback: (balance: number) => void
  ) => void;
  children: React.ReactElement;
};

export const Wallet = ({
  currencies,
  onCurrencySelected,
  children
}: WalletProps) => {
  const [balance, setBalance] = useState<number>(0);

  const [currencySelected, setCurrencySelected] = useState<WalletCurrency>(
    currencies[0]
  );

  const refreshCurrency = (currency: WalletCurrency) => {
    onCurrencySelected(currency, (balance: number) => {
      setBalance(balance);
      setCurrencySelected(currency);
    });
  };

  useEffect(() => {
    refreshCurrency(currencies[0]);
  }, []);

  return (
    <WalletContainer>
      <BalanceContainer>
        <CurrencySelection>
          {currencies?.map((currency: WalletCurrency, index: number) => (
            <CurrencyTab
              key={index}
              selected={currency.symbol == currencySelected?.symbol}
              onClick={() => refreshCurrency(currency)}
            >
              <p>
                {currency.name} - {currency.symbol}
              </p>
            </CurrencyTab>
          ))}
        </CurrencySelection>
        <Balance>
          <p>Your balance</p>
          {currencySelected && (
            <React.Fragment>
              <h1>
                {Number(balance || 0).toFixed(currencySelected?.precision || 3)}
              </h1>
              <p>{currencySelected?.symbol}</p>
            </React.Fragment>
          )}
          <BalanceActions>{children}</BalanceActions>
        </Balance>
      </BalanceContainer>
    </WalletContainer>
  );
};

export default Wallet;
