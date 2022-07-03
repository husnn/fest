import {
  NotificationCategory,
  NotificationDTO,
  NotificationPriority,
  NotificationTopic,
  Result
} from '@fest/shared';
import { NotificationRepository, UserRepository } from '../repositories';

import { Notification } from '../entities';

interface NotificationData {
  priority: NotificationPriority;
  category: NotificationCategory;
  topic: NotificationTopic;
  values: any;
}

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;

  constructor(
    notificationRepository: NotificationRepository,
    userRepository: UserRepository
  ) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
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

  async getForUser(
    userId: string,
    all = false
  ): Promise<
    Result<{
      notifications: NotificationDTO[];
      lastSeen: Date;
    }>
  > {
    const user = await this.userRepository.get(userId);
    const lastSeen = user.preferences?.notificationsLastSeen;

    const notifications = await this.notificationRepository.findForUser(
      userId,
      !all && lastSeen
    );

    user.preferences = {
      ...user.preferences,
      notificationsLastSeen: new Date()
    };
    this.userRepository.update(user);

    return Result.ok({
      notifications: notifications.map((n) => {
        return new NotificationDTO({
          ...n,
          text: this.makeText(n)
        });
      }),
      lastSeen
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
