import { InviteStatus, InviteType } from '@fest/shared';

import { EntitySchema } from 'typeorm';
import { Invite } from '@fest/core';

const InviteSchema = new EntitySchema<Invite>({
  name: 'invite',
  columns: {
    id: {
      type: 'integer',
      generated: 'increment',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },
    status: {
      type: 'enum',
      enum: InviteStatus,
      default: InviteStatus.ACTIVE
    },
    expiryDate: {
      type: 'timestamp',
      name: 'expiry_date',
      nullable: true
    },
    type: {
      type: 'enum',
      enum: InviteType,
      default: InviteType.BASIC
    },
    ownerId: {
      type: 'text',
      name: 'owner_id'
    },
    code: {
      type: 'text'
    },
    useCount: {
      type: 'integer',
      default: 0
    },
    maxUseCount: {
      type: 'integer',
      nullable: true
    }
  },
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'owner_id',
        referencedColumnName: 'id'
      }
    }
  }
});

export default InviteSchema;
