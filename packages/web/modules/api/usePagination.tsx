import React, { useEffect, useRef, useState } from 'react';

import { PaginatedResponse } from '@fanbase/shared';

const usePagination = <U extends unknown>(
  query?: (count: number, page: number) => Promise<PaginatedResponse<U>>
) => {
  const [data, setData] = useState<U[]>([]);

  const [count, setCount] = useState(undefined);
  const [page, setPage] = useState(undefined);

  const [hasMore, setHasMore] = useState(false);

  const fetch = () => {
    query(count, page).then((res: PaginatedResponse<U>) => {
      setData([...data, ...res.body]);

      setCount(res.count);
      setPage(res.nextPage);

      setHasMore(res.nextPage != null);
    });
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetch();
    }
  }, []);

  const loadMore = () => fetch();

  return { data, loadMore, count, page, hasMore };
};

export default usePagination;
