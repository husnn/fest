import { InviteRepository as IInviteRepository, Invite } from '@fanbase/core';

import InviteSchema from '../schemas/InviteSchema';
import Repository from './Repository';

export class InviteRepository
  extends Repository<Invite>
  implements IInviteRepository
{
  constructor() {
    super(InviteSchema);
  }

  findByCode(code: string): Promise<Invite> {
    return this.db
      .createQueryBuilder()
      .where('LOWER(code) = LOWER(:code)', { code })
      .getOne();
  }
}
