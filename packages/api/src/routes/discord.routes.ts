import { NextFunction, Request, Response, Router } from 'express';

import DiscordController from '../controllers/DiscordController';
import authMiddleware from '../middleware/authMiddleware';

export default function init(discordController: DiscordController) {
  const router = Router();

  router.get(
    '/link',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.getAuthLink(req, res, next)
  );

  router.post(
    '/link',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.link(req, res, next)
  );

  router.delete(
    '/link',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.unlink(req, res, next)
  );

  router.get(
    '/linked',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
      discordController.getLinkStatus(req, res, next)
  );

  return router;
}
