import { Response as ExpressResponse, NextFunction, Request } from 'express';
import { HttpError, HttpResponse } from '../http';

import { Response } from '@fanbase/shared';

export interface ErrorResponse extends Response {
  error: string;
  message: string;
}

function errorHandler(
  err: Error,
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) {
  console.log(err.stack);

  const error: HttpError = err instanceof HttpError ? err : new HttpError();

  const { name, message, status } = error;

  const data: ErrorResponse = {
    success: false,
    error: name,
    message,
    status
  };

  return new HttpResponse<ErrorResponse>(res, data);
}

export default errorHandler;
