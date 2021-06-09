import { Wallet } from '../entities';
import Repository from './Repository';

export interface WalletRepository extends Repository<Wallet> {
  findByUser(protocol: string, user: string): Promise<Wallet>;
  findByAddress(protocol: string, address: string): Promise<Wallet>;
}

export default WalletRepository;
