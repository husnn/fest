import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { appConfig } from '../config';

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, appConfig.jwtSecret, (err: any, data: any) => {
    if (err) return res.sendStatus(403);
    req.user = data.user;
  });

  next();
};
