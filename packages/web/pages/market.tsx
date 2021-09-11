import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import Contracts from '@fanbase/eth-contracts';
import { TokenListingDTO, TokenOfferDTO, TokenTradeDTO } from '@fanbase/shared';

import CancelTokenListing from '../components/CancelTokenListing';
import Wallet, { WalletCurrency } from '../components/Wallet';
import WithdrawEarnings from '../components/WithdrawEarnings';
import { ApiClient } from '../modules/api';
import useAuthentication from '../modules/auth/useAuthentication';
import EthereumClient from '../modules/ethereum/EthereumClient';
import { useHeader } from '../modules/navigation';
import { Button, Link } from '../ui';
import { getPrice, getTokenUrl } from '../utils';

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
  const price = getPrice(data.price);

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
          <span style={{ opacity: 0.5 }}>{price.currency}</span>
          <span>{price.amount}</span>
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

  const getEarnings = async (currency: WalletCurrency): Promise<string> => {
    let currencyContract;

    switch (currency.symbol) {
      case 'DAI':
        currencyContract = process.env.ETH_CONTRACT_DAI_ADDRESS;
        break;
      case 'FAN':
        currencyContract = Contracts.Contracts.FAN.get().options.address;
        break;
    }

    return EthereumClient.instance.getMarketEarnings(
      currencyContract,
      currentUser.wallet.address
    );
  };

  const [earnings, setEarnings] = useState<{
    currency: string;
    amount: string;
  }>({
    currency: 'DAI',
    amount: '0'
  });

  return currentUser ? (
    <div className="container boxed" style={{ maxWidth: 600 }}>
      <MarketSection>
        <h2>Earnings</h2>
        <Wallet
          currencies={[
            {
              name: 'Fan Coin',
              symbol: 'FAN'
            },
            {
              name: 'Dai',
              symbol: 'DAI'
            }
          ]}
          onCurrencySelected={async (currency: WalletCurrency, callback) => {
            getEarnings(currency)
              .then((balance: string) => {
                balance
                  ? setEarnings({
                      currency: currency.symbol,
                      amount: balance
                    })
                  : null;

                const b = getPrice(balance);

                callback(b.amount);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          {earnings && (
            <Button size="small" onClick={() => setWithdrawing(true)}>
              Withdraw
            </Button>
          )}
        </Wallet>
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
          onDone={() => {
            setTimeout(() => {
              router.reload();
            }, 2000);
          }}
        />
      )}
      {isWithdrawing && (
        <WithdrawEarnings
          currency={earnings.currency}
          amount={earnings.amount}
          onClose={() => setWithdrawing(false)}
          onDone={() => {
            setTimeout(() => {
              router.reload();
            }, 2000);
          }}
        />
      )}
    </div>
  ) : null;
}
