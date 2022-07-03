import { NextFunction, Request, Response, Router } from 'express';

import DiscordController from '../controllers/DiscordController';
import protectedRoute from '../middleware/protectedRoute';

export default function init(discordController: DiscordController) {
  const router = Router();

  router.get(
    '/link',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.getAuthLink(req, res, next)
  );

  router.post(
    '/link',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.link(req, res, next)
  );

  router.delete(
    '/link',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.unlink(req, res, next)
  );

  router.get(
    '/linked',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.getLinkStatus(req, res, next)
  );

  return router;
}
