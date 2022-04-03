import { NextFunction, Request, Response, Router } from 'express';
import AuthController from '../controllers/AuthController';
import authMiddleware from '../middleware/authMiddleware';
import { getRateLimiter } from '../middleware/rateLimiting';

export default function init(authController: AuthController) {
  const router = Router();

  router.post('/precheck', (req: Request, res: Response, next: NextFunction) =>
    authController.doPrecheck(req, res, next)
  );

  router.post(
    '/identify/email',
    getRateLimiter('identify', { max: 5, windowInMins: 1 }),
    (req: Request, res: Response, next: NextFunction) =>
      authController.identifyWithEmail(req, res, next)
  );

  router.post(
    '/identify/wallet',
    (req: Request, res: Response, next: NextFunction) =>
      authController.identifyWithWallet(req, res, next)
  );

  router.post(
    '/login/email',
    getRateLimiter('login', { max: 5, windowInMins: 1 }),
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithEmail(req, res, next)
  );

  router.post(
    '/reset-password',
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.email) authController.requestPasswordReset(req, res, next);
      else authController.resetPassword(req, res, next);
    }
  );

  router.post(
    '/email-change',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      authController.requestEmailChange(req, res, next);
    }
  );

  router.post(
    '/change-email',
    (req: Request, res: Response, next: NextFunction) => {
      authController.changeEmailAddress(req, res, next);
    }
  );

  router.post(
    '/login/wallet',
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithWallet(req, res, next)
  );

  router.post('/signout', (req: Request, res: Response) => {
    authController.setCookie(res, '', 0);
    res.status(200).end();
  });

  return router;
}
