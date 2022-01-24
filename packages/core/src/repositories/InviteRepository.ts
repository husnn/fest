import Invite from '../entities/Invite';
import { InviteType } from '@fest/shared';
import Repository from './Repository';

export interface InviteRepository extends Repository<Invite> {
  findByOwner(
    user: string,
    opts?: { inviteType: InviteType },
    count?: number,
    page?: number
  ): Promise<{ invites: Invite[]; total: number }>;

  findByCode(code: string): Promise<Invite>;
}

export default InviteRepository;
