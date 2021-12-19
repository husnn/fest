import {
  NotificationCategory,
  NotificationPriority,
  NotificationTopic
} from '../services/NotificationService';

export class Notification {
  id: string;

  dateCreated?: Date;

  priority: NotificationPriority;

  category: NotificationCategory;
  topic: NotificationTopic;

  recipientId: string;

  values?: {
    [key: string]: string;
  };

  resources?: {
    [resourceType: string]: string;
  };

  constructor(data?: Partial<Notification>) {
    Object.assign(this, data);
  }
}

export default Notification;
