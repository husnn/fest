import { EntitySchema } from 'typeorm';

import { TokenListing } from '@fest/core';
import { Protocol, TokenListingStatus } from '@fest/shared';

const TokenListingSchema = new EntitySchema<TokenListing>({
  name: 'token_listing',
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
    sellerId: {
      type: 'uuid',
      name: 'seller_id'
    },
    tokenId: {
      type: 'uuid',
      name: 'token_id'
    },
    quantity: {
      type: 'integer',
      default: 0
    },
    available: {
      type: 'integer',
      default: 0
    },
    price: {
      type: 'jsonb'
    },
    maxPurchasable: {
      type: 'integer',
      nullable: true
    },
    expiry: {
      type: 'timestamp',
      nullable: true
    },
    chain: {
      type: 'jsonb'
    },
    status: {
      type: 'enum',
      enum: TokenListingStatus
    }
  },
  relations: {
    seller: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'seller_id',
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
  }
});

export default TokenListingSchema;
