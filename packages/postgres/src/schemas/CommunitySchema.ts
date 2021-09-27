import { Community } from '@fanbase/core';
import { EntitySchema } from 'typeorm';

const CommunitySchema = new EntitySchema<Community>({
  name: 'community',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    creatorId: {
      type: 'text',
      name: 'creator_id'
    },
    name: {
      type: 'text'
    }
  },
  relations: {
    creator: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'creator_id',
        referencedColumnName: 'id'
      }
    },
    tokens: {
      type: 'many-to-many',
      target: 'token',
      inverseSide: 'communities',
      joinTable: {
        name: 'tokens_communities',
        joinColumn: {
          name: 'community_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'token_id',
          referencedColumnName: 'id'
        }
      }
    }
  }
});

export default CommunitySchema;
