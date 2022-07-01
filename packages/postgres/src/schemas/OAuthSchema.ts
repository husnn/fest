import { EntitySchema } from 'typeorm';
import { OAuth } from '@fest/core';
import { OAuthProvider } from '@fest/shared';

const OAuthSchema = new EntitySchema<OAuth>({
  name: 'oauth',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    userId: {
      type: 'text',
      name: 'user_id'
    },
    provider: {
      type: 'enum',
      enum: OAuthProvider
    },
    externalId: {
      type: 'text',
      name: 'external_id',
      nullable: true
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
