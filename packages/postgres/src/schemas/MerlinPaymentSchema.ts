import { MerlinPayment } from '@fest/core';
import { Protocol } from '@fest/shared';
import { EntitySchema } from 'typeorm';

const MerlinPaymentSchema = new EntitySchema<MerlinPayment>({
  name: 'merlin_balance',
  columns: {
    id: {
      type: 'integer',
      generated: 'increment',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      name: 'date_created',
      createDate: true
    },
    walletId: {
      type: 'text',
      name: 'wallet_id'
    },
    protocol: {
      type: 'enum',
      enum: Protocol
    },
    networkId: {
      type: 'integer',
      name: 'network_id'
    },
    contract: {
      type: 'text',
      nullable: true
    },
    currency: {
      type: 'text'
    },
    amount: {
      type: 'text'
    },
    txHash: {
      type: 'text',
      name: 'tx_hash'
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
    }
  }
});

export default MerlinPaymentSchema;
