import { NextFunction, Request, Response, Router } from 'express';

import { HttpError } from '../http';
import UserController from '../controllers/UserController';
import { getRateLimiter } from '../middleware/rateLimiting';
import pagination from '../middleware/pagination';
import protectedRoute from '../middleware/protectedRoute';
import { upload } from '../services/AvatarService';

export default function init(userController: UserController) {
  const router = Router();

  router.get(
    '/referral',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) => {
      userController.getReferralSummary(req, res, next);
    }
  );

  router.get('/:id?', (req: Request, res: Response, next: NextFunction) =>
    userController.get(req, res, next)
  );

  router.get(
    '/:id/communities',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      userController.getCommunities(req, res, next)
  );

  router.get(
    '/:id/tokens-created',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      userController.getTokensCreated(req, res, next)
  );

  router.get(
    '/:id/tokens-owned',
    pagination,
    (req: Request, res: Response, next: NextFunction) =>
      userController.getTokensOwned(req, res, next)
  );

  router.post(
    '/me',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      userController.editUser(req, res, next)
  );

  router.post(
    '/enable-creator',
    protectedRoute,
    (req: Request, res: Response, next: NextFunction) =>
      userController.enableCreatorMode(req, res, next)
  );

  router.post(
    '/me/avatar',
    getRateLimiter('avatar', { max: 5, windowInMins: 10 }),
    protectedRoute,
    upload.single('avatar'),
    (req: Request, res: Response, next: NextFunction) => {
      upload.single('avatar')(req, res, function (err) {
        if (err || !(req as any).file) {
          return next(err || new HttpError('Missing upload file', 400));
        }

        userController.updateAvatar(req, res, next);
      });
    }
  );

  return router;
}
