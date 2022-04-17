import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig, authCookieName } from '../config';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies[authCookieName] == null) return res.sendStatus(401);

  jwt.verify(
    req.cookies[authCookieName],
    appConfig.jwtSecret,
    (err, data: any) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      req.user = data.userId;
    }
  );

  next();
};
