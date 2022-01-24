import {
  WaitlistRepository as IWaitlistRepository,
  WaitlistEntry
} from '@fest/core';

import Repository from './Repository';
import WaitlistEntrySchema from '../schemas/WaitlistEntrySchema';

export class WaitlistRepository
  extends Repository<WaitlistEntry>
  implements IWaitlistRepository
{
  constructor() {
    super(WaitlistEntrySchema);
  }

  async findByEmailOrWallet(identifier: string): Promise<WaitlistEntry> {
    return this.db
      .createQueryBuilder('entry')
      .where('entry.email = :identifier', { identifier })
      .orWhere('LOWER(entry.wallet) = LOWER(:identifier)', { identifier })
      .getOne();
  }

  async getAll(): Promise<{
    entries: WaitlistEntry[];
    total: number;
  }> {
    const [entries, count] = await this.db
      .createQueryBuilder()
      .getManyAndCount();

    return {
      entries,
      total: count
    };
  }
}
