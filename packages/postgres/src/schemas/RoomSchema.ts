import { EntitySchema } from 'typeorm';
import { Room } from '@fest/core';

const RoomSchema = new EntitySchema<Room>({
  name: 'room',
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
