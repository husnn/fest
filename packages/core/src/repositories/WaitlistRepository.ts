import Repository from './Repository';
import WaitlistEntry from '../entities/WaitlistEntry';

export interface WaitlistRepository extends Repository<WaitlistEntry> {
  findByEmailOrWallet(identifier: string): Promise<WaitlistEntry>;
}

export default WaitlistRepository;
