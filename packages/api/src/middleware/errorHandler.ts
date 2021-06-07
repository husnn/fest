import { NextFunction, Request, Response as ExpressResponse } from 'express';

import { Response } from '@fanbase/shared';

import { HttpError, HttpResponse } from '../http';

export interface ErrorResponse extends Response {
  error: string;
  message: string;
}

function errorHandler (
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
