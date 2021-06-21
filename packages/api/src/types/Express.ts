import Express, { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      pagination?: {
        count?: number;
        page?: number;
      };
    }
  }
}
