import { EntitySchema } from 'typeorm';

import { Wallet } from '@fest/core';
import { Protocol, WalletType } from '@fest/shared';

const WalletSchema = new EntitySchema<Wallet>({
  name: 'wallet',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    type: {
      type: 'enum',
      enum: WalletType
    },
    protocol: {
      type: 'enum',
      enum: Protocol
    },
    address: {
      type: 'text'
    },
    publicKey: {
      type: 'text',
      nullable: true,
      select: false
    },
    privateKey: {
      type: 'text',
      nullable: true,
      select: false
    },
    seed: {
      type: 'text',
      nullable: true,
      select: false
    },
    ownerId: {
      type: 'text',
      name: 'owner_id',
      nullable: true
    }
  },
  relations: {
    owner: {
      type: 'one-to-one',
      target: 'user',
      joinColumn: {
        name: 'owner_id',
        referencedColumnName: 'id'
      }
    }
  },
  indices: [
    {
      columns: ['protocol', 'address'],
      unique: true
    },
    {
      columns: ['protocol', 'publicKey'],
      unique: true
    }
  ]
});

export default WalletSchema;
