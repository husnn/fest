import { EntitySchema } from 'typeorm';
import { Invite } from '@fanbase/core';
import { InviteStatus } from '@fanbase/shared';

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
    },
    isCreator: {
      type: 'bool',
      name: 'is_creator',
      default: false
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
