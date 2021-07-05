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
    dateSent: {
      type: 'timestamp',
      name: 'date_sent',
      createDate: true
    },
    status: {
      type: 'enum',
      enum: OfferStatus
    },
    senderId: {
      type: 'text',
      name: 'sender_id'
    },
    ownershipId: {
      type: 'text',
      name: 'ownership_id'
    },
    quantity: {
      type: 'integer',
      default: 1
    },
    currency: {
      type: 'enum',
      enum: Currency
    },
    price: {
      type: 'integer'
    },
    expiry: {
      type: 'timestamp',
      name: 'expiry'
    },
    signature: {
      type: 'text'
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
