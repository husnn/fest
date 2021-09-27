import React, { useEffect, useRef, useState } from 'react';

import { PaginatedResponse } from '@fanbase/shared';

const usePagination = <U extends unknown>(
  query: (count: number, page: number, args?) => Promise<PaginatedResponse<U>>,
  args = []
) => {
  const [data, setData] = useState<U[]>([]);

  const [count, setCount] = useState(undefined);
  const [page, setPage] = useState(undefined);

  const [hasMore, setHasMore] = useState(false);

  const fetch = () => {
    query(count, page, ...args).then((res: PaginatedResponse<U>) => {
      setData([...data, ...res.body]);

      setCount(res.count);
      setPage(res.nextPage);

      setHasMore(res.nextPage != null);
    });
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    for (const x of args) {
      if (typeof x === 'undefined') return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetch();
    }
  }, args);

  const loadMore = () => fetch();

  return { data, loadMore, count, page, hasMore };
};

export default usePagination;
