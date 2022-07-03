import { NextFunction, Request, Response, Router } from 'express';

import YouTubeController from '../controllers/YouTubeController';
import protectedRoute from '../middleware/protectedRoute';

export default function init(youTubeController: YouTubeController) {
  const router = Router();

  router.get(
    '/uploads',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      youTubeController.getOwnUploads(req, res, next)
  );

  return router;
}
