import { EntitySchema } from 'typeorm';

import { Token } from '@fanbase/core';

const TokenSchema = new EntitySchema<Token>({
  name: 'token',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    creatorId: {
      type: 'uuid',
      name: 'creator_id',
      nullable: true
    },
    supply: {
      type: 'integer',
      default: 0
    },
    minted: {
      type: 'boolean',
      default: false
    },
    chain: {
      type: 'simple-json',
      nullable: true
    }
  },
  relations: {
    creator: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'creator_id',
        referencedColumnName: 'id'
      }
    }
  }
});

export default TokenSchema;
