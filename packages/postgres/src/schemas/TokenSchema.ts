import { Token } from '@fest/core';
import { TokenType } from '@fest/shared';
import { EntitySchema } from 'typeorm';

const TokenSchema = new EntitySchema<Token>({
  name: 'token',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },
    creatorId: {
      type: 'text',
      name: 'creator_id',
      nullable: true
    },
    type: {
      type: 'enum',
      enum: TokenType,
      default: TokenType.BASIC
    },
    name: {
      type: 'text'
    },
    description: {
      type: 'text',
      nullable: true
    },
    supply: {
      type: 'integer',
      default: 0
    },
    image: {
      type: 'text',
      nullable: true
    },
    externalUrl: {
      type: 'text',
      nullable: true
    },
    royaltyPct: {
      type: 'integer',
      name: 'royalty_pct',
      default: 0
    },
    attributes: {
      type: 'simple-json',
      nullable: true
    },
    extra: {
      type: 'simple-json',
      nullable: true
    },
    mediaUri: {
      type: 'text',
      nullable: true
    },
    metadataUri: {
      type: 'text',
      nullable: true
    },
    chain: {
      type: 'jsonb',
      nullable: true
    },
    minted: {
      type: 'boolean',
      default: false
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
    },
    communities: {
      type: 'many-to-many',
      target: 'community',
      inverseSide: 'tokens'
    }
  }
});

export default TokenSchema;
