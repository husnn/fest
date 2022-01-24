import { TokenTradeDTO } from '@fest/shared';
import React, { useEffect } from 'react';
import { ApiClient } from '../../modules/api';
import usePagination from '../../modules/api/usePagination';
import useAuthentication from '../../modules/auth/useAuthentication';
import { useHeader } from '../../modules/navigation';
import TokenTradeRow from '../../ui/TokenTradeRow';

export const TradesPage = () => {
  useAuthentication(true);

  useHeader();

  const { data, loadMore, hasMore } = usePagination<TokenTradeDTO>(
    (count: number, page: number) =>
      ApiClient.instance.getTokenTradesForUser(count || 10, page)
  );

  return (
    <div className="container boxed">
      {data.map((trade) => (
        <TokenTradeRow key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

export default TradesPage;
