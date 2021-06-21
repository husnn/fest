import React from 'react';

import { Token } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import usePagination from '../modules/api/usePagination';
import TokenCollection from '../ui/TokenCollection';

type TokensCreatedProps = {
  user: string;
  onTokenSelected?: (token: Token) => void;
};

const TokensCreated = ({ user, onTokenSelected }: TokensCreatedProps) => {
  const { data, loadMore, hasMore } = usePagination<Token>(
    (count: number, page: number) =>
      ApiClient.instance.getTokensCreated(user, count, page)
  );

  return (
    <div>
      {data && (
        <TokenCollection
          tokens={data}
          onLoadMore={hasMore ? () => loadMore() : null}
          onTokenSelected={(token: Token) =>
            onTokenSelected ? onTokenSelected(token) : null
          }
        />
      )}
    </div>
  );
};

export default TokensCreated;
