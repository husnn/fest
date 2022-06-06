import { Notification } from '@fest/core';
import {
  NotificationCategory,
  NotificationPriority,
  NotificationTopic
} from '@fest/shared';
import { EntitySchema } from 'typeorm';

const NotificationSchema = new EntitySchema<Notification>({
  name: 'notification',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },

    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },

    priority: {
      type: 'integer',
      enum: NotificationPriority
    },

    category: {
      type: 'enum',
      enum: NotificationCategory
    },

    topic: {
      type: 'enum',
      enum: NotificationTopic
    },

    recipientId: {
      type: 'text',
      name: 'recipient_id'
    },

    values: {
      type: 'simple-json',
      nullable: true
    },

    resources: {
      type: 'jsonb',
      nullable: true
    }
  }
});

export default NotificationSchema;
