import { EntitySchema } from 'typeorm';
import { Room } from '@fanbase/core';

const RoomSchema = new EntitySchema<Room>({
  name: 'room',
  tableName: 'rooms',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    communityId: {
      type: 'text',
      name: 'community_id'
    },
    name: {
      type: 'text'
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
    }
  },
  indices: [
    {
      columns: ['communityId', 'name'],
      unique: true
    }
  ]
});

export default RoomSchema;
