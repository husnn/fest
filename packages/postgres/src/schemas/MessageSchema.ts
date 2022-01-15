import { EntitySchema } from 'typeorm';
import { Message } from '@fanbase/core';
import { MessageType } from '@fanbase/shared';

const MessageSchema = new EntitySchema<Message>({
  name: 'message',
  tableName: 'messages',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      createDate: true,
      name: 'date_created'
    },
    dateUpdated: {
      type: 'timestamp',
      updateDate: true,
      name: 'date_updated'
    },
    communityId: {
      type: 'text',
      name: 'community_id'
    },
    type: {
      type: 'enum',
      enum: MessageType
    },
    parentId: {
      type: 'uuid',
      name: 'parent_id',
      nullable: true
    },
    userId: {
      type: 'text',
      name: 'user_id'
    },
    text: {
      type: 'text'
    },
    media: {
      type: 'simple-json',
      array: true
    }
  },
  relations: {
    community: {
      type: 'many-to-one',
      target: 'community',
      joinColumn: {
        name: 'community_id',
        referencedColumnName: 'id'
      }
    },
    rooms: {
      type: 'many-to-many',
      target: 'room',
      inverseSide: 'messages',
      joinTable: {
        name: 'rooms_messages',
        joinColumn: {
          name: 'message_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'room_id',
          referencedColumnName: 'id'
        }
      }
    }
  }
});

export default MessageSchema;
