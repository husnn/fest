import { EntitySchema } from 'typeorm';
import { TokenOwnership } from '@fest/core';

const TokenOwnershipSchema = new EntitySchema<TokenOwnership>({
  name: 'token_ownership',
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
    dateUpdated: {
      type: 'timestamp',
      name: 'date_updated',
      updateDate: true
    },
    walletId: {
      type: 'text',
      name: 'wallet_id',
      nullable: true
    },
    tokenId: {
      type: 'text',
      name: 'token_id'
    },
    quantity: {
      type: 'integer',
      default: 1
    }
  },
  relations: {
    wallet: {
      type: 'many-to-one',
      target: 'wallet',
      joinColumn: {
        name: 'wallet_id',
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
      columns: ['walletId', 'tokenId'],
      unique: true
    }
  ]
});

export default TokenOwnershipSchema;
