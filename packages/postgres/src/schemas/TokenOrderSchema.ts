import { EntitySchema } from 'typeorm';

import { TokenOrder } from '@fanbase/core';

const TokenOrderSchema = new EntitySchema<TokenOrder>({
  name: 'token_order',
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
    sellerId: {
      type: 'uuid',
      name: 'seller_id'
    },
    buyerId: {
      type: 'uuid',
      name: 'buyer_id'
    },
    tokenListingId: {
      type: 'uuid',
      name: 'token_listing_id'
    },
    quantity: {
      type: 'integer',
      default: 0
    },
    price: {
      type: 'text',
      default: 0
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
    buyer: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'buyer_id',
        referencedColumnName: 'id'
      }
    },
    tokenListing: {
      type: 'many-to-one',
      target: 'token_listing',
      joinColumn: {
        name: 'token_listing_id',
        referencedColumnName: 'id'
      }
    }
  }
});

export default TokenOrderSchema;
