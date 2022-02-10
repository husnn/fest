import { Protocol } from '@fest/shared';

export class Transaction {
  readonly id: string;

  readonly dateCreated: Date;

  protocol: Protocol;
  networkId: number;

  from: string;
  to: string;

  value?: string;

  gasUsed: string;
  gasPrice: string;

  hash: string;

  constructor(data: Partial<Transaction>) {
    Object.assign(this, data);
  }
}

export default Transaction;
