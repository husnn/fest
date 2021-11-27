import { NextFunction, Request, Response, Router } from 'express';

import YouTubeController from '../controllers/YouTubeController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(youTubeController: YouTubeController) {
  const router = Router();

  router.get(
    '/uploads',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      youTubeController.getOwnUploads(req, res, next)
  );

  return router;
}
