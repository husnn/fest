import { NextFunction, Request, Response, Router } from 'express';
import PostController from '../controllers/PostController';
import authMiddleware from '../middleware/authMiddleware';
import { getRateLimiter } from '../middleware/rateLimiting';

export default function init(postController: PostController): Router {
  const router = Router();

  router.post(
    '/',
    getRateLimiter('createPost', { max: 10, windowInMins: 1 }),
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      postController.create(req, res, next)
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
