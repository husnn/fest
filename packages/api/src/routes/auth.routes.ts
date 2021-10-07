import { NextFunction, Request, Response, Router } from 'express';

import AuthController from '../controllers/AuthController';

export default function init(router: Router, authController: AuthController) {
  router.post('/precheck', (req: Request, res: Response, next: NextFunction) =>
    authController.doPrecheck(req, res, next)
  );

  router.post(
    '/identify/email',
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
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithEmail(req, res, next)
  );

  router.post(
    '/login/wallet',
    (req: Request, res: Response, next: NextFunction) =>
      authController.loginWithWallet(req, res, next)
  );

  return router;
}
