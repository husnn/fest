import Transaction from '../entities/Transaction';
import Repository from './Repository';

export interface TransactionRepository extends Repository<Transaction> {}

export default TransactionRepository;
