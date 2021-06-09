import { EntitySchema } from 'typeorm';

import { TokenOffer } from '@fanbase/core';
import { Currency, OfferStatus } from '@fanbase/shared';

const TokenOfferSchema = new EntitySchema<TokenOffer>({
  name: 'token_offer',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true
    },
    status: {
      type: 'enum',
      enum: OfferStatus
    },
    senderId: {
      type: 'uuid',
      name: 'sender_id'
    },
    ownershipId: {
      type: 'uuid',
      name: 'ownership_id'
    },
    currency: {
      type: 'enum',
      enum: Currency
    },
    amount: {
      type: 'integer',
      default: 0
    }
  },
  relations: {
    sender: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'sender_id',
        referencedColumnName: 'id'
      }
    },
    ownership: {
      type: 'many-to-one',
      target: 'token_ownership',
      joinColumn: {
        name: 'ownership_id',
        referencedColumnName: 'id'
      }
    }
  }
});

export default TokenOfferSchema;
