import { Protocol } from '@fest/shared';
import { Wallet } from '.';

export class MerlinPayment {
  id: number;

  dateCreated: Date;

  walletId: string;
  wallet?: Wallet;

  protocol: Protocol;
  networkId: number;

  contract: string;

  currency: string;
  amount: string;

  txHash: string;

  constructor(data?: Partial<MerlinPayment>) {
    Object.assign(this, data);
  }
}

export default MerlinPayment;
