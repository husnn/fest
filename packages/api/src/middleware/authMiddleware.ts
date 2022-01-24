import { NextFunction, Request, Response } from 'express';

import { appConfig } from '../config';
import jwt from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, appConfig.jwtSecret, (err, data: any) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = data.userId;
  });

  next();
};
