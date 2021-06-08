import { EntitySchema } from 'typeorm';

import { OAuth, OAuthProvider } from '@fanbase/shared';

const OAuthSchema = new EntitySchema<OAuth>({
  name: 'oauth',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    userId: {
      type: 'uuid',
      name: 'user_id',
      nullable: true
    },
    provider: {
      type: 'enum',
      enum: OAuthProvider
    },
    accessToken: {
      type: 'text'
    },
    refreshToken: {
      type: 'text',
      nullable: true
    },
    expiry: {
      type: 'timestamp'
    }
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
      }
    }
  },
  indices: [
    {
      columns: ['userId', 'provider'],
      unique: true
    }
  ]
});

export default OAuthSchema;
