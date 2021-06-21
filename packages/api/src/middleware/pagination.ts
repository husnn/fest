import { NextFunction, Request, Response } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  let page: string | undefined = req.query.page?.toString();
  let count: string | undefined = req.query.perPage?.toString();

  req.pagination = {
    count: count ? parseInt(count) : 15,
    page: page ? parseInt(page) : 1
  };

  next();
};
