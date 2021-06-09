import { EntitySchema } from 'typeorm';

import { TokenOwnership } from '@fanbase/core';

const TokenOwnershipSchema = new EntitySchema<TokenOwnership>({
  name: 'token_ownership',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    ownerId: {
      type: 'uuid',
      name: 'owner_id'
    },
    tokenId: {
      type: 'uuid',
      name: 'token_id'
    },
    quantity: {
      type: 'integer',
      default: 0
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
    },
    token: {
      type: 'many-to-one',
      target: 'token',
      joinColumn: {
        name: 'token_id',
        referencedColumnName: 'id'
      }
    }
  },
  indices: [
    {
      columns: ['ownerId', 'tokenId'],
      unique: true
    }
  ]
});

export default TokenOwnershipSchema;
