import {
  NotificationRepository as INotificationRepository,
  Notification
} from '@fanbase/core';

import NotificationSchema from '../schemas/NotificationSchema';
import Repository from './Repository';

export class NotificationRepository
  extends Repository<Notification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationSchema);
  }

  findForUser(userId: string): Promise<Notification[]> {
    return this.db.find({ recipientId: userId });
  }
}
