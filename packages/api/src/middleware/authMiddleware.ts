import { NextFunction, Request, Response } from 'express';
import { appConfig, authCookieName } from '../config';

import jwt from 'jsonwebtoken';
import logger from '@fest/logger';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies[authCookieName] == null) return res.sendStatus(401);

  jwt.verify(
    req.cookies[authCookieName],
    appConfig.jwtSecret,
    (err, data: any) => {
      if (err) {
        logger.error(err);
        return res.sendStatus(403);
      }
      req.user = data.userId;
    }
  );

  next();
};
