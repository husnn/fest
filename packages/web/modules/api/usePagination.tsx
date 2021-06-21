import React, { useEffect, useState } from 'react';

import { PaginatedResponse } from '@fanbase/shared';

const usePagination = <U extends unknown>(
  query?: (count: number, page: number) => Promise<PaginatedResponse<U>>
) => {
  const [data, setData] = useState<U | any>([]);

  const [count, setCount] = useState(null);
  const [page, setPage] = useState(null);

  const [hasMore, setHasMore] = useState(false);

  const fetch = () => {
    query(count, page).then((res: PaginatedResponse<U>) => {
      setData([...data, ...res.body]);

      setCount(res.count);
      setPage(res.nextPage);

      setHasMore(res.nextPage != null);
    });
  };

  useEffect(() => fetch(), []);

  const loadMore = () => fetch();

  return { data, loadMore, count, page, hasMore };
};

export default usePagination;
