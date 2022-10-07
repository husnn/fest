import { ApiClient } from '../../modules/api';
import { NextSeo } from 'next-seo';
import { TokenTradeDTO } from '@fest/shared';
import TokenTradeRow from '../../ui/TokenTradeRow';
import useAuthentication from '../../modules/auth/useAuthentication';
import { useHeader } from '../../modules/navigation';
import usePagination from '../../modules/api/usePagination';

export const TradesPage = () => {
  useAuthentication(true);

  useHeader();

  const { data } = usePagination<TokenTradeDTO>((count: number, page: number) =>
    ApiClient.instance.getTokenTradesForUser(count || 10, page)
  );

  return (
    <div className="container boxed">
      <NextSeo noindex />
      {data.map((trade) => (
        <TokenTradeRow key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

export default TradesPage;
