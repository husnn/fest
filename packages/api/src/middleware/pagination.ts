import { NextFunction, Request, Response } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  const count: string | undefined = req.query.count?.toString();
  const page: string | undefined = req.query.page?.toString();

  req.pagination = {
    count: count ? parseInt(count) : 15,
    page: page ? parseInt(page) : 1
  };

  next();
};
