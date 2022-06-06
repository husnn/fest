import { NotificationService } from '@fest/core';
import { GetNotificationsResponse } from '@fest/shared';
import { Router } from 'express';
import { HttpError, HttpResponse } from '../http';
import authMiddleware from '../middleware/authMiddleware';

export default function init(notificationService: NotificationService) {
  const router = Router();

  router.get('/', authMiddleware, async (req, res, next) => {
    try {
      const result = await notificationService.getForUser(
        req.user,
        req.query.all === 'true'
      );
      if (!result.success)
        throw new HttpError('Could not get notifications for user.');

      return new HttpResponse<GetNotificationsResponse>(res, {
        body: result.data.notifications,
        lastSeen: result.data.lastSeen
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
