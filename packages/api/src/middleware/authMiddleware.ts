import { NextFunction, Request, Response } from 'express';
import { appConfig, authCookieName } from '../config';

import jwt from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies[authCookieName] == null) return next();

  jwt.verify(
    req.cookies[authCookieName],
    appConfig.jwtSecret,
    (err, data: any) => {
      if (!err) req.user = data.userId;
    }
  );

  next();
};
