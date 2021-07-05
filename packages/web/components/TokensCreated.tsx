import React from 'react';

import { TokenDTO } from '@fanbase/shared';

import ApiClient from '../modules/api/ApiClient';
import usePagination from '../modules/api/usePagination';
import TokenCollection from '../ui/TokenCollection';

type TokensCreatedProps = {
  user: string;
  onTokenSelected?: (token: TokenDTO) => void;
};

const TokensCreated = ({ user, onTokenSelected }: TokensCreatedProps) => {
  const { data, loadMore, hasMore } = usePagination<TokenDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getTokensCreated(user, count, page)
  );

  return (
    <div>
      {data && (
        <TokenCollection
          tokens={data}
          onLoadMore={hasMore ? () => loadMore() : null}
          onTokenSelected={(token: TokenDTO) =>
            onTokenSelected ? onTokenSelected(token) : null
          }
        />
      )}
    </div>
  );
};

export default TokensCreated;
