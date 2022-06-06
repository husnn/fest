import {
  Notification,
  NotificationRepository as INotificationRepository
} from '@fest/core';
import { MoreThan } from 'typeorm';
import NotificationSchema from '../schemas/NotificationSchema';
import Repository from './Repository';

export class NotificationRepository
  extends Repository<Notification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationSchema);
  }

  findForUser(userId: string, after?: Date): Promise<Notification[]> {
    return this.db.find({
      where: {
        recipientId: userId,
        dateCreated: MoreThan(after || new Date(0))
      }
    });
  }
}
