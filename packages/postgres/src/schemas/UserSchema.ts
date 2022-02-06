import { User } from '@fest/core';
import { EntitySchema } from 'typeorm';

const UserSchema = new EntitySchema<User>({
  name: 'user',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    email: {
      type: 'text',
      name: 'email',
      unique: true,
      nullable: true
    },
    password: {
      type: 'text',
      name: 'password',
      nullable: true,
      select: false
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
      nullable: true,
      select: false
    },
    emailChangeToken: {
      type: 'simple-json',
      name: 'email_change_token',
      nullable: true,
      select: false
    },
    passwordResetToken: {
      type: 'simple-json',
      name: 'password_reset_token',
      nullable: true,
      select: false
    },
    walletId: {
      type: 'text',
      name: 'wallet_id',
      nullable: true
    },
    isCreator: {
      type: 'bool',
      name: 'is_creator',
      default: false
    },
    lastLoginIP: {
      type: 'text',
      name: 'last_login_ip',
      nullable: true
    },
    lastLogin: {
      type: 'timestamp',
      name: 'last_login',
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
    },
    communities: {
      type: 'many-to-many',
      target: 'community',
      inverseSide: 'users'
    }
  }
});

export default UserSchema;
