import { EntitySchema } from 'typeorm';
import { Referral } from '@fanbase/core';

const ReferralSchema = new EntitySchema<Referral>({
  name: 'referral',
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
    inviteId: {
      type: 'integer',
      name: 'invite_id'
    },
    referrerId: {
      type: 'text',
      name: 'referrer_id'
    },
    refereeId: {
      type: 'text',
      name: 'referee_id'
    }
  },
  relations: {
    invite: {
      type: 'many-to-one',
      target: 'invite',
      joinColumn: {
        name: 'invite_id',
        referencedColumnName: 'id'
      }
    },
    referrer: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'referrer_id',
        referencedColumnName: 'id'
      }
    },
    referee: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'referee_id',
        referencedColumnName: 'id'
      }
    }
  },
  indices: [
    {
      columns: ['inviteId', 'refereeId'],
      unique: true
    }
  ]
});

export default ReferralSchema;
