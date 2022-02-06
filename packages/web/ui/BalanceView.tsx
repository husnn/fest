import React, { useEffect, useState } from 'react';

import { CurrencyBalance } from '../types';
import styled from '@emotion/styled';

const Container = styled.div`
  margin: 20px 0;
`;

const Wrapper = styled.div`
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

const BalanceContainer = styled.div`
  padding: 50px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
    margin-top: 15px;
  }
`;

const Balance = styled.div`
  > * + * {
    margin-top: 5px;
  }
`;

const BalanceActions = styled.div`
  width: 180px;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;

  > * + * {
    margin-left: 10px;
  }
`;

type BalanceViewProps = {
  balances: CurrencyBalance[];
  onSelect: (currency: CurrencyBalance) => void;
  children: React.ReactElement;
};

export const BalanceView = ({
  balances,
  onSelect,
  children
}: BalanceViewProps) => {
  const [selected, setSelected] = useState<CurrencyBalance>();

  useEffect(() => {
    const s = balances.find((x) => x.selected) || balances[0];

    if (s && !selected) onSelect(s);

    setSelected(s);
  }, [balances]);

  return (
    <Container>
      <Wrapper>
        <CurrencySelection>
          {balances?.map((balance: CurrencyBalance, index: number) => (
            <CurrencyTab
              key={index}
              selected={balance.currency.symbol === selected?.currency.symbol}
              onClick={() => onSelect(balance)}
            >
              <p>
                {balance.currency.name} - {balance.currency.symbol}
              </p>
            </CurrencyTab>
          ))}
        </CurrencySelection>
        <BalanceContainer>
          <Balance>
            <p>Your balance</p>
            {selected ? (
              <React.Fragment>
                <h1>
                  {selected.balance.displayAmount.toFixed(
                    selected.precision || 5
                  )}
                </h1>
                <p>{selected.currency.symbol}</p>
              </React.Fragment>
            ) : (
              <h1>{Number(0).toFixed(3)}</h1>
            )}
          </Balance>
          <BalanceActions>{children}</BalanceActions>
        </BalanceContainer>
      </Wrapper>
    </Container>
  );
};

export default BalanceView;
