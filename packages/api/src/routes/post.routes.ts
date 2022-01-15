import { NextFunction, Request, Response, Router } from 'express';

import PostController from '../controllers/PostController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(postController: PostController): Router {
  const router = Router();

  router.post(
    '/',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      postController.create(req, res, next)
  );

  return router;
}
