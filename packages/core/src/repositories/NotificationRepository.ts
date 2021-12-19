import { Notification } from '../entities';
import Repository from './Repository';

export interface NotificationRepository extends Repository<Notification> {
  findForUser(userId: string): Promise<Notification[]>;
}

export default NotificationRepository;
