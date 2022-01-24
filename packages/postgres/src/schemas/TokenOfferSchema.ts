import { EntitySchema } from 'typeorm';

import { TokenOffer } from '@fest/core';
import { Currency, OfferStatus } from '@fest/shared';

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
    receiverId: {
      type: 'text',
      name: 'receiver_id'
    },
    ownershipId: {
      type: 'text',
      name: 'ownership_id'
    },
    quantity: {
      type: 'integer',
      default: 1
    },
    price: {
      type: 'jsonb'
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
    receiver: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'receiver_id',
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
