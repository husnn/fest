import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import Contracts from '@fanbase/eth-contracts';
import { Balance, TokenListingDTO, TokenOfferDTO, TokenTradeDTO } from '@fanbase/shared';

import BalanceView from '../components/BalanceView';
import CancelTokenListing from '../components/CancelTokenListing';
import WithdrawEarnings from '../components/WithdrawEarnings';
import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import { useHeader } from '../modules/navigation';
import { useWeb3 } from '../modules/web3';
import { CurrencyBalance } from '../types';
import { Button, Link } from '../ui';
import { getTokenUrl, reloadInTime } from '../utils';

const MarketSection = styled.div`
  padding: 20px 10px;

  > * + * {
    margin-top: 20px;
  }
`;

const ListingRow = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  box-shadow: 5px 5px 10px 5px rgba(0, 0, 0, 0.05);

  :not(:first-of-type) {
    margin-top: 20px;
  }

  > div > * {
    display: block;
    margin-top: 10px;
  }

  .token-listing__date {
    opacity: 0.7;
  }

  .token-listing__name {
    font-weight: bold;
    font-size: 11pt;
  }

  .token-listing__left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .token-listing__right {
    min-width: 100px;
    text-align: center;
  }
`;

const ListingPrice = styled.h3`
  > * + * {
    margin-left: 5px;
  }
`;

const TokenListingRow = ({
  data,
  onCancel
}: {
  data: TokenListingDTO;
  onCancel: (id: string) => void;
}) => {
  const sold = data.quantity - data.available;

  return (
    <ListingRow>
      <div className="token-listing__left">
        <div>
          <p className="token-listing__date small">
            {moment(data.dateCreated).fromNow()}
          </p>
          <Link href={getTokenUrl(data.token)} className="token-listing__name">
            {data.token.name}
          </Link>
        </div>
        <ListingPrice>
          <span style={{ opacity: 0.5 }}>{data.price.currency.symbol}</span>
          <span>{data.price.displayAmount.toPrecision()}</span>
        </ListingPrice>
      </div>
      <div className="token-listing__right">
        <p className="token-listing__sold small">
          {sold}/{data.quantity} Sold
        </p>
        {sold > 0 && <Button size="smaller">View trades</Button>}
        <Link className="smaller" onClick={() => onCancel(data.id)}>
          Cancel listing
        </Link>
      </div>
    </ListingRow>
  );
};

export default function MarketPage() {
  const [tokenMarketSummary, setTokenMarketSummary] = useState<{
    offers: TokenOfferDTO[];
    listings: TokenListingDTO[];
    trades: TokenTradeDTO[];
  }>();

  useHeader(['wallet', 'profile']);

  const router = useRouter();

  const { currentUser } = useAuthentication(true);

  const [listingToCancel, setListingToCancel] = useState(null);
  const [isWithdrawing, setWithdrawing] = useState(false);

  /**
   * Single API call to retrieve a condensed list of offers, listings and trades
   */
  useEffect(() => {
    ApiClient.instance
      ?.getTokenMarketSummary()
      .then(({ offers, listings, trades }) => {
        setTokenMarketSummary({ offers, listings, trades });
      });
  }, []);

  const web3 = useWeb3();

  const [marketBalances, setMarketBalances] = useState<CurrencyBalance[]>([]);

  useEffect(() => {
    if (!web3.ethereum) return;

    setMarketBalances([
      ...web3.config.market.currenciesSupported.map(
        (currency, index: number) => {
          return {
            currency,
            balance: Balance(0),
            precision: 3,
            selected: index == 0
          };
        }
      )
    ]);
  }, [web3.ethereum]);

  const updateEarnings = async (balance: CurrencyBalance) => {
    const bal = await web3.ethereum.getMarketEarnings(
      currentUser.wallet.address,
      balance.currency.contract
    );

    marketBalances.map((element) => {
      element.selected = false;

      if (element.currency.symbol === balance.currency.symbol) {
        element.balance.set(bal);
        element.selected = true;
      }

      return element;
    });

    setMarketBalances([...marketBalances]);
  };

  const getSelectedBalance = (): CurrencyBalance =>
    marketBalances.find((x: CurrencyBalance) => x.selected === true);

  return currentUser ? (
    <div className="container boxed" style={{ maxWidth: 600 }}>
      <MarketSection>
        <h2>Earnings</h2>
        <BalanceView
          balances={marketBalances}
          onSelect={(balance: CurrencyBalance) => updateEarnings(balance)}
        >
          {marketBalances && (
            <Button size="small" onClick={() => setWithdrawing(true)}>
              Withdraw
            </Button>
          )}
        </BalanceView>
      </MarketSection>
      {tokenMarketSummary?.offers?.length > 0 && (
        <MarketSection>
          <h2>Offers</h2>
        </MarketSection>
      )}
      {tokenMarketSummary?.listings?.length > 0 && (
        <MarketSection>
          <h2>Listings</h2>
          <div className="token-listings">
            {tokenMarketSummary?.listings?.map((listing: TokenListingDTO) => (
              <TokenListingRow
                key={listing.id}
                data={listing}
                onCancel={() => setListingToCancel(listing)}
              />
            ))}
          </div>
          <Button color="secondary" style={{ width: '100%' }}>
            View all
          </Button>
        </MarketSection>
      )}
      {tokenMarketSummary?.trades?.length > 0 && (
        <MarketSection>
          <h2>Trades</h2>
        </MarketSection>
      )}
      {listingToCancel && (
        <CancelTokenListing
          listing={listingToCancel}
          onClose={() => setListingToCancel(null)}
          onDone={() => reloadInTime(router, 2)}
        />
      )}
      {isWithdrawing && (
        <WithdrawEarnings
          balance={getSelectedBalance()}
          onClose={() => setWithdrawing(false)}
          onDone={() => reloadInTime(router, 2)}
        />
      )}
    </div>
  ) : null;
}
