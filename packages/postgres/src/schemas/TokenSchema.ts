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
    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
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
    name: {
      type: 'text'
    },
    description: {
      type: 'text',
      nullable: true
    },
    minted: {
      type: 'boolean',
      default: false
    },
    chain: {
      type: 'jsonb',
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
