import React from 'react';

import styled from '@emotion/styled';
import { CurrentUserDTO, TokenOwnershipDTO } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import usePagination from '../modules/api/usePagination';
import useAuthentication from '../modules/auth/useAuthentication';
import { Button, Link } from '../ui';
import { getDisplayName, getProfileUrl } from '../utils';

const HolderRow = styled.div<{
  selected: boolean;
}>`
  margin-top: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  opacity: ${(props) => (props.selected ? 1 : '0.7')};
  // border: ${(props) => props.selected && `1px solid #9a9a9a`};
  box-shadow: ${(props) =>
    props.selected && '2px 2px 8px 4px rgba(0, 0, 0, 0.05);'};
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
  width: 50px;
  height: 50px;
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
      ApiClient.instance.getTokenOwnerships(token, count, page)
  );

  return (
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
              <Avatar className="avatar"></Avatar>
              <HolderInfo style={{ cursor: 'default' }}>
                <Link
                  href={
                    selected?.id == ownership?.id
                      ? ownership.owner &&
                        getProfileUrl({ id: ownership.owner.id })
                      : null
                  }
                >
                  <h4>{getDisplayName(ownership.owner, ownership.wallet)}</h4>
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
  );
};

export default TokenHolders;
