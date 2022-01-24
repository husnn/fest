import { Protocol, TransactionType } from '@fest/shared';

export class Transaction {
  readonly id: string;

  protocol: Protocol;

  network: number;

  chain: number;

  type: TransactionType;

  hash: string;
}

export default Transaction;
