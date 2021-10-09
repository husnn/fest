import Invite from '../entities/Invite';
import Repository from './Repository';

export interface InviteRepository extends Repository<Invite> {
  findByCode(code: string): Promise<Invite>;
}

export default InviteRepository;
