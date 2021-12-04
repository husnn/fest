import Repository from './Repository';
import WaitlistEntry from '../entities/WaitlistEntry';

export interface WaitlistRepository extends Repository<WaitlistEntry> {
  findByEmailOrWallet(identifier: string): Promise<WaitlistEntry>;
  getAll(): Promise<{
    entries: WaitlistEntry[];
    total: number;
  }>;
}

export default WaitlistRepository;
