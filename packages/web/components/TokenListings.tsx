import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { TokenDTO, TokenListingDTO, TokenListingStatus } from '@fanbase/shared';

import { ApiClient } from '../modules/api';
import usePagination from '../modules/api/usePagination';
import useAuthentication from '../modules/auth/useAuthentication';
import { Button, Link } from '../ui';
import { getDisplayName, getProfileUrl } from '../utils';
import BuyTokenListing from './BuyTokenListing';

const Container = styled.div``;

const TokenListingRow = styled.div<{ active: boolean }>`
  margin: 20px -10px;
  padding: 10px 20px 20px;
  background-color: #fafafa;
  display: grid;
  align-items: center;
  grid-template-columns: 2fr 1fr;
  grid-auto-rows: 80px;
  border-radius: 10px;

  ${(props) =>
    props.active
      ? `
        box-shadow: 5px 5px 10px 5px rgba(0, 0, 0, 0.02);
        `
      : 'opacitY: 0.5;'}

  > * {
    padding: 5px;
  }
`;

const TokenListingColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenListing = ({ listing }: { listing: TokenListingDTO }) => {
  const { currentUser } = useAuthentication();
  const router = useRouter();

  const isActive = listing.status == TokenListingStatus.Active;

  const [buying, setBuying] = useState(false);

  return (
    <TokenListingRow active={isActive}>
      <TokenListingColumn>
        <label>{moment(listing.dateCreated).fromNow()}</label>
        <h4 className="wallet-address">
          <Link
            href={getProfileUrl({
              username: listing.seller?.username,
              id: listing.seller?.id
            })}
          >
            {getDisplayName(listing.seller)}
          </Link>
        </h4>
        <p>
          {listing.price.currency.symbol}{' '}
          {listing.price.displayAmount.toPrecision()}
        </p>
      </TokenListingColumn>
      {/* <TokenListingColumn>
        <label>Available</label>
        <p>
          {listing.available} / {listing.quantity}
        </p>
      </TokenListingColumn> */}
      <TokenListingColumn>
        {isActive && currentUser && listing.seller?.id != currentUser.id && (
          <Button
            color="secondary"
            size="smaller"
            onClick={() => setBuying(true)}
            disabled={buying}
          >
            Buy
          </Button>
        )}
      </TokenListingColumn>
      {buying && (
        <BuyTokenListing
          listing={listing}
          setBuying={(buying) => setBuying(buying)}
          onBought={() => {
            setTimeout(() => {
              router.reload();
            }, 2000);
          }}
        />
      )}
    </TokenListingRow>
  );
};

type TokenListingsProps = {
  token: TokenDTO;
};

export const TokenListings = ({ token }: TokenListingsProps) => {
  const { currentUser } = useAuthentication();

  const [listings, setListings] = useState([]);

  const { data, loadMore, hasMore } = usePagination<TokenListingDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getListingsForToken(token.id, count || 5, page)
  );

  useEffect(() => {
    // const existing = new Set();

    // const filtered = data.filter((listing) => {
    //   if (!existing.has(listing.seller.id)) {
    //     existing.add(listing.seller.id);
    //     return listing;
    //   }
    // });

    data.sort((a) => a.seller.id == currentUser?.id && -1);

    setListings(data);
  }, [data]);

  return listings && listings.length > 0 ? (
    <Container>
      <h3>Market Listings</h3>
      {listings?.map((item: TokenListingDTO) => (
        <TokenListing key={item.id} listing={item} />
      ))}
      {hasMore && (
        <Button size="small" onClick={() => loadMore()}>
          Load more
        </Button>
      )}
    </Container>
  ) : null;
};

export default TokenListings;
