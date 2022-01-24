import { PaginatedResponse, Response } from '@fest/shared';

import { Response as ExpressResponse } from 'express';

export class HttpResponse<U extends Response | PaginatedResponse> {
  constructor(
    res: ExpressResponse,
    data?: Partial<U>,
    pageData?: {
      count: number;
      page: number;
      total?: number;
    }
  ) {
    const success = data
      ? data.success || typeof data.error === 'undefined'
      : true;
    const status = data?.status || 200;

    const response: Response = {
      ...data,
      ...(pageData && {
        count: pageData.count,
        page: pageData.page,
        nextPage:
          pageData.total && pageData.total - pageData.count * pageData.page > 0
            ? pageData.page + 1
            : null
      }),
      success,
      status
    };

    res.status(status).send(response);
  }
}

export default HttpResponse;
