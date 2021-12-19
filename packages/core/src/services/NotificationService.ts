import { Notification } from '../entities';
import { NotificationDTO } from '@fanbase/shared';
import { NotificationRepository } from '../repositories';

export enum NotificationPriority {
  NORMAL = 1,
  IMPORTANT = 2,
  CRITICAL = 3
}

export enum NotificationCategory {
  MARKET = 'MARKET'
}

export enum NotificationTopic {
  TOKEN_MARKET_SALE = 'TOKEN_MARKET_SALE',
  TOKEN_MARKET_ROYALTY_PAYMENT = 'TOKEN_MARKET_ROYALTY_PAYMENT'
}

interface NotificationData {
  priority: NotificationPriority;
  category: NotificationCategory;
  topic: NotificationTopic;
  values: any;
}

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  create(recipientId: string, data: NotificationData) {
    this.notificationRepository.create(
      new Notification({
        priority: data.priority,
        category: data.category,
        topic: data.topic,
        recipientId,
        values: data.values
      })
    );
  }

  async getForUser(userId: string): Promise<NotificationDTO[]> {
    const notifications = await this.notificationRepository.findForUser(userId);

    return notifications.map((n) => {
      return new NotificationDTO({
        text: this.makeText(n)
      });
    });
  }

  makeText(notification: Notification): string {
    let body = this.getTemplate(notification.topic);

    Object.entries(notification.values).map(([key, value]) => {
      body = body.replace(`{${key}}`, value);
    });

    return body;
  }

  getTemplate(id: NotificationTopic): string {
    let template: string;

    switch (id) {
      case NotificationTopic.TOKEN_MARKET_SALE:
        template = 'You received a new sale for {currency} {amount}';
        break;
      case NotificationTopic.TOKEN_MARKET_ROYALTY_PAYMENT:
        template = 'You received a royalty payment of {currency} {amount}';
        break;
    }

    return template;
  }
}

export default NotificationService;
