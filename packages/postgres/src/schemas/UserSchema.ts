import { EntitySchema } from 'typeorm';

import { User } from '@fanbase/core';

const UserSchema = new EntitySchema<User>({
  name: 'user',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    email: {
      type: 'text',
      name: 'email',
      unique: true,
      nullable: true
    },
    username: {
      type: 'text',
      name: 'username',
      unique: true,
      nullable: true
    },
    name: {
      type: 'text',
      name: 'name',
      nullable: true
    },
    bio: {
      type: 'text',
      name: 'bio',
      nullable: true
    },
    loginCode: {
      type: 'simple-json',
      name: 'login_code',
      nullable: true
    },
    walletId: {
      type: 'uuid',
      name: 'wallet_id',
      nullable: true
    }
  },
  relations: {
    wallet: {
      type: 'one-to-one',
      target: 'wallet',
      joinColumn: {
        name: 'wallet_id',
        referencedColumnName: 'id'
      }
    },
    tokensCreated: {
      type: 'one-to-many',
      target: 'token',
      inverseSide: 'creator'
    }
  }
});

export default UserSchema;
