import { TokenTradeDTO } from '@fanbase/shared';
import React, { useEffect } from 'react';
import { ApiClient } from '../../modules/api';
import usePagination from '../../modules/api/usePagination';
import TokenTradeRow from '../../ui/TokenTradeRow';

export const TradesPage = () => {
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
