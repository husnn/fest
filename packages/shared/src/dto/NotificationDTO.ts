import {
  NotificationCategory,
  NotificationPriority,
  NotificationTopic
} from '../enums';

export class NotificationDTO {
  dateCreated?: Date;

  priority: NotificationPriority;

  category: NotificationCategory;
  topic: NotificationTopic;

  text: string;

  constructor(data: Partial<NotificationDTO>) {
    this.dateCreated = data.dateCreated;
    this.priority = data.priority;
    this.category = data.category;
    this.topic = data.topic;
    this.text = data.text;
  }
}
