import React, { useEffect } from 'react';

import styled from '@emotion/styled';
import { CurrentUserDTO, TokenOwnershipDTO } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import usePagination from '../modules/api/usePagination';
import useAuthentication from '../modules/auth/useAuthentication';
import { Button, Link } from '../ui';
import { getDisplayName, getProfileUrl } from '../utils';

const Container = styled.div`
  > * + * {
    margin-top: 20px;
  }
`;

const HolderRow = styled.div<{
  selected: boolean;
}>`
  margin-top: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  opacity: ${(props) => (props.selected ? 1 : '0.5')};
  box-shadow: ${(props) =>
    props.selected && '0px 5px 10px 5px rgba(0, 0, 0, 0.05);'};
  border-radius: 20px;
  cursor: pointer;

  div:first-of-type {
    display: flex;
    align-items: center;

    > * + * {
      margin-left: 20px;
    }
  }

  > * + * {
    margin-top: 20px;
  }
`;

const Avatar = styled.div`
  min-width: 50px;
  min-height: 50px;
`;

const HolderInfo = styled.div`
  > * + * {
    margin-top: 5px;
  }
`;

type TokenHoldersProps = {
  token: string;
  selected?: TokenOwnershipDTO;
  setSelected?: (ownership: TokenOwnershipDTO) => void;
  currentUser?: CurrentUserDTO;
  listForSale?: (ownnership: TokenOwnershipDTO) => void;
};

const TokenHolders = ({
  token,
  selected,
  setSelected,
  listForSale
}: TokenHoldersProps) => {
  const { currentUser } = useAuthentication();

  const { data, loadMore, hasMore } = usePagination<TokenOwnershipDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getTokenOwnerships(token, count || 10, page)
  );

  useEffect(() => {
    if (data && !selected) setSelected(data[0]);
  }, [data]);

  return (
    <Container>
      <div>
        {data &&
          data.map((ownership: TokenOwnershipDTO, index: number) => (
            <HolderRow
              key={index}
              selected={ownership?.id == selected?.id}
              onClick={() => {
                setSelected(ownership);
              }}
            >
              <div>
                <Avatar className="avatar" />
                <HolderInfo style={{ cursor: 'default' }}>
                  <Link
                    href={
                      selected?.id == ownership?.id
                        ? ownership.owner &&
                          getProfileUrl({ id: ownership.owner.id })
                        : null
                    }
                  >
                    <h4 style={{ wordBreak: 'break-all' }}>
                      {getDisplayName(ownership.owner, ownership.wallet)}
                    </h4>
                  </Link>
                  <p className="smaller">{ownership.quantity} owned</p>
                </HolderInfo>
              </div>
              {selected?.id == ownership?.id && (
                <React.Fragment>
                  {currentUser &&
                  ownership?.walletId == currentUser?.wallet.id ? (
                    <Button
                      size="small"
                      onClick={() =>
                        listForSale ? listForSale(ownership) : null
                      }
                    >
                      List for sale
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => {
                        // Make and send offer
                      }}
                    >
                      Make offer
                    </Button>
                  )}
                </React.Fragment>
              )}
            </HolderRow>
          ))}
      </div>
      {hasMore && (
        <Button size="small" onClick={() => loadMore()}>
          Load more
        </Button>
      )}
    </Container>
  );
};

export default TokenHolders;
