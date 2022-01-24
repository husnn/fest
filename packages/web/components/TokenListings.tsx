import { Button, Link } from '../ui';
import React, { useEffect, useState } from 'react';
import { TokenListingDTO, TokenListingStatus } from '@fest/shared';
import { getDisplayName, getProfileUrl } from '../utils';

import BuyTokenListing from './BuyTokenListing';
import moment from 'moment';
import styled from '@emotion/styled';
import useAuthentication from '../modules/auth/useAuthentication';
import { useRouter } from 'next/router';

const Container = styled.div``;

const TokenListingRow = styled.div<{ active: boolean }>`
  margin: 20px -10px;
  padding: 10px 20px 20px;
  background-color: white;
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
  listings: TokenListingDTO[];
  currentUserId?: string;
  hasMore: boolean;
  loadMore?: () => void;
};

export const TokenListings = ({
  listings,
  currentUserId,
  hasMore,
  loadMore
}: TokenListingsProps) => {
  const [listingsToShow, setListingsToShow] = useState<TokenListingDTO[]>([]);

  useEffect(() => {
    // const existing = new Set();

    // const filtered = data.filter((listing) => {
    //   if (!existing.has(listing.seller.id)) {
    //     existing.add(listing.seller.id);
    //     return listing;
    //   }
    // });

    listings.sort((a) => a.seller.id == currentUserId && -1);

    setListingsToShow(listings);
  }, [listings]);

  return (
    <Container>
      {listingsToShow?.map((item: TokenListingDTO) => (
        <TokenListing key={item.id} listing={item} />
      ))}
      {hasMore && (
        <Button size="small" onClick={() => loadMore()}>
          Load more
        </Button>
      )}
    </Container>
  );
};

export default TokenListings;
