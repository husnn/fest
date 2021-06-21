import { EntitySchema } from 'typeorm';

import { Wallet } from '@fanbase/core';
import { Protocol, WalletType } from '@fanbase/shared';

const WalletSchema = new EntitySchema<Wallet>({
  name: 'wallet',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
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
      nullable: true
    },
    privateKey: {
      type: 'text',
      nullable: true
    },
    seed: {
      type: 'text',
      nullable: true
    },
    ownerId: {
      type: 'uuid',
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
