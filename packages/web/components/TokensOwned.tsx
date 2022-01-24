import React from 'react';

import { TokenOwnedDTO } from '@fest/shared';

import ApiClient from '../modules/api/ApiClient';
import usePagination from '../modules/api/usePagination';
import TokenCollection from '../ui/TokenCollection';

type TokensOwnedProps = {
  user: string;
  onTokenSelected?: (token: TokenOwnedDTO) => void;
};

const TokensOwned = ({ user, onTokenSelected }: TokensOwnedProps) => {
  const { data, loadMore, hasMore } = usePagination<TokenOwnedDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getTokensOwned(user, count, page)
  );

  return (
    <div>
      {data && (
        <TokenCollection
          tokens={data}
          onLoadMore={hasMore ? () => loadMore() : null}
          onTokenSelected={(token: TokenOwnedDTO) =>
            onTokenSelected ? onTokenSelected(token) : null
          }
        />
      )}
    </div>
  );
};

export default TokensOwned;
