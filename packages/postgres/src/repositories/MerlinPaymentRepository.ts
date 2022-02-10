import { MerlinPayment } from '@fest/core';
import { Protocol } from '@fest/shared';
import MerlinPaymentSchema from '../schemas/MerlinPaymentSchema';
import Repository from './Repository';

export class MerlinPaymentRepository extends Repository<MerlinPayment> {
  constructor() {
    super(MerlinPaymentSchema);
  }

  async getAllBelowAmount(
    protocol: Protocol,
    networkId: number,
    amount: string,
    contract?: string
  ): Promise<MerlinPayment[]> {
    const query = this.db
      .createQueryBuilder('payment')
      .where('payment.protocol = :protocol', { protocol })
      .andWhere('payment.networkId = :networkId', { networkId })
      .andWhere('payment.amount < :amount', { amount })
      .leftJoinAndSelect('payment.wallet', 'wallet');

    if (contract) query.andWhere('payment.contract = :contract', { contract });

    return query.getMany();
  }
}

export default MerlinPaymentRepository;
