import { EntitySchema } from 'typeorm';
import { TokenTrade } from '@fest/core';

const TokenTradeSchema = new EntitySchema<TokenTrade>({
  name: 'token_trade',
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
      type: 'text',
      name: 'seller_id'
    },
    buyerId: {
      type: 'text',
      name: 'buyer_id'
    },
    tokenListingId: {
      type: 'uuid',
      name: 'token_listing_id'
    },
    quantity: {
      type: 'integer',
      default: 1
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

export default TokenTradeSchema;
