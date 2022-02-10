import {
  Transaction,
  TransactionRepository as ITransactionRepository
} from '@fest/core';
import TransactionSchema from '../schemas/TransactionSchema';
import Repository from './Repository';

export class TransactionRepository
  extends Repository<Transaction>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionSchema);
  }
}

export default TransactionRepository;
