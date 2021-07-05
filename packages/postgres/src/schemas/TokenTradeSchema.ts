import { EntitySchema } from 'typeorm';

import { TokenTrade } from '@fanbase/core';
import { Protocol, TokenTradeStatus } from '@fanbase/shared';

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
    protocol: {
      type: 'enum',
      enum: Protocol
    },
    sellerWalletId: {
      type: 'uuid',
      name: 'seller_wallet_id',
      nullable: true
    },
    tokenId: {
      type: 'uuid',
      name: 'token_id',
      nullable: true
    },
    quantity: {
      type: 'integer',
      default: 0
    },
    available: {
      type: 'integer',
      default: 0
    },
    currency: {
      type: 'text'
    },
    price: {
      type: 'text',
      default: 0
    },
    chain: {
      type: 'jsonb'
    },
    status: {
      type: 'enum',
      enum: TokenTradeStatus
    }
  },
  relations: {
    sellerWallet: {
      type: 'many-to-one',
      target: 'wallet',
      joinColumn: {
        name: 'seller_wallet_id',
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

export default TokenTradeSchema;
