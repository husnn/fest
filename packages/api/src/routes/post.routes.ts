import { NextFunction, Request, Response, Router } from 'express';

import PostController from '../controllers/PostController';
import { getRateLimiter } from '../middleware/rateLimiting';
import protectedRoute from '../middleware/protectedRoute';

export default function init(postController: PostController): Router {
  const router = Router();

  router.post(
    '/',
    getRateLimiter('createPost', { max: 10, windowInMins: 1 }),
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      postController.create(req, res, next)
  );

  router.post(
    '/:id/delete',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      postController.delete(req, res, next)
  );

  router.post(
    '/media-upload-urls',
    getRateLimiter('postMediaUpload', { max: 10, windowInMins: 1 }),
    (req: Request, res: Response, next: NextFunction) => {
      postController.getMediaUploadURLs(req, res, next);
    }
  );

  return router;
}
