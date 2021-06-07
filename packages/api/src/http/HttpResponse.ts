import { Response as ExpressResponse } from 'express';

import { Response } from '@fanbase/shared';

export class HttpResponse<U extends Response> {
  constructor (res: ExpressResponse, data?: Partial<U>) {
    const success = data?.success || true;
    const status = data?.status || 200;

    const response: Response = {
      ...data,
      success,
      status
    };

    res.status(status).send(response);
  }
}

export default HttpResponse;
