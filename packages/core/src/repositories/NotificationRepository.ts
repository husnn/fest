import { Notification } from '../entities';
import Repository from './Repository';

export interface NotificationRepository extends Repository<Notification> {
  findForUser(userId: string, after?: Date): Promise<Notification[]>;
}

export default NotificationRepository;
