import { TokenTradeDTO, getTokenUrl } from '@fest/shared';

import Decimal from 'decimal.js';
import Link from './Link';
import React from 'react';
import moment from 'moment';
import styled from '@emotion/styled';
import { useBalance } from '../modules/useBalance';

type TokenTradeRowProps = {
  trade: TokenTradeDTO;
};

const RowContainer = styled.div`
  width: 100%;
  background-color: white;
  padding: 30px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: start;

  > * + * {
    margin-top: 10px;
  }

  p.sold,
  p.bought {
    display: block;
    padding: 2px 10px;
    border-radius: 10px;
    color: white;
  }

  p.sold {
    background-color: #ff9898;
  }

  p.bought {
    background-color: #00d391;
  }
`;

export const TokenTradeRow = ({ trade }: TokenTradeRowProps) => {
  const price = trade.tokenListing.price;
  const total = new Decimal(price.amount).mul(trade.quantity);

  const [balance] = useBalance(total, price.currency.decimals);

  const isSale = trade.isSeller;

  return (
    <RowContainer>
      <p className="small">{moment(trade.dateCreated).fromNow()}</p>
      <Link href={getTokenUrl(trade.tokenListing.token)}>
        <h3>{trade.tokenListing.token.name}</h3>
      </Link>
      <p>
        <span style={{ opacity: 0.5 }}>{price.currency.symbol}</span>{' '}
        {balance.displayAmount.toPrecision()}
      </p>
      <p className={`small ${isSale ? 'sold' : 'bought'}`}>
        You {isSale ? 'sold' : 'bought'}
      </p>
    </RowContainer>
  );
};

export default TokenTradeRow;
