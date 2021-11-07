import { EntitySchema } from 'typeorm';
import { WaitlistEntry } from '@fanbase/core';
import { WaitlistEntryType } from '@fanbase/shared';

const WaitlistEntrySchema = new EntitySchema<WaitlistEntry>({
  name: 'waitlist_entry',
  columns: {
    id: {
      type: 'integer',
      generated: 'increment',
      primary: true
    },
    type: {
      type: 'enum',
      enum: WaitlistEntryType,
      default: WaitlistEntryType.NORMAL
    },
    entryDate: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },
    email: {
      type: 'text'
    },
    wallet: {
      type: 'text',
      nullable: true
    },
    socialMedia: {
      type: 'text',
      nullable: true
    },
    isAccepted: {
      type: 'bool',
      default: false
    },
    dateAccepted: {
      type: 'timestamp',
      name: 'date_accepted',
      nullable: true
    }
  },
  indices: [
    {
      columns: ['type', 'email'],
      unique: true
    },
    {
      columns: ['type', 'wallet'],
      unique: true
    }
  ]
});

export default WaitlistEntrySchema;
