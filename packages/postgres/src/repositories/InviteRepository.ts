import { InviteRepository as IInviteRepository, Invite } from '@fanbase/core';

import InviteSchema from '../schemas/InviteSchema';
import { InviteType } from '@fanbase/shared';
import Repository from './Repository';

export class InviteRepository
  extends Repository<Invite>
  implements IInviteRepository
{
  constructor() {
    super(InviteSchema);
  }

  async findByOwner(
    user: string,
    opts?: { inviteType: InviteType },
    count = 10,
    page = 1
  ): Promise<{ invites: Invite[]; total: number }> {
    const query = this.db
      .createQueryBuilder()
      .where('owner_id = :user', { user })
      .skip((page - 1) * count)
      .take(count);

    if (opts?.inviteType) {
      query.andWhere('type = :type', {
        type: opts.inviteType
      });
    }

    const [invites, total] = await query.getManyAndCount();

    return { invites, total };
  }

  findByCode(code: string): Promise<Invite> {
    return this.db
      .createQueryBuilder()
      .where('LOWER(code) = LOWER(:code)', { code })
      .getOne();
  }
}
