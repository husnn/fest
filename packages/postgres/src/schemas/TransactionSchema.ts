import { Transaction } from '@fest/core';
import { Protocol } from '@fest/shared';
import { EntitySchema } from 'typeorm';

const TransactionSchema = new EntitySchema<Transaction>({
  name: 'transaction',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },
    protocol: {
      type: 'enum',
      enum: Protocol
    },
    networkId: {
      type: 'integer'
    },
    from: {
      type: 'text'
    },
    to: {
      type: 'text'
    },
    value: {
      type: 'text',
      nullable: true
    },
    gasUsed: {
      type: 'text'
    },
    gasPrice: {
      type: 'text'
    },
    hash: {
      type: 'text'
    }
  },
  indices: [
    {
      columns: ['protocol', 'networkId', 'hash'],
      unique: true
    }
  ]
});

export default TransactionSchema;
