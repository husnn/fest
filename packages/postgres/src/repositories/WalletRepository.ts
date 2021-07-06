import { Wallet, WalletRepository as IWalletRepository } from '@fanbase/core';

import WalletSchema from '../schemas/WalletSchema';
import Repository from './Repository';

export class WalletRepository
  extends Repository<Wallet>
  implements IWalletRepository
{
  constructor() {
    super(WalletSchema);
  }

  async findByUser(
    protocol: string,
    user: string,
    options?: { select?: Array<keyof Wallet> }
  ): Promise<Wallet> {
    const query = this.db
      .createQueryBuilder('wallet')
      .where('wallet.protocol = :protocol', { protocol })
      .andWhere('wallet.ownerId = :user', { user });

    if (options?.select) {
      query.addSelect(options.select.map((property) => `wallet.${property}`));
    }

    return query.getOne();
  }

  async findByAddress(protocol: string, address: string): Promise<Wallet> {
    return await this.db
      .createQueryBuilder('wallet')
      .where('wallet.protocol = :protocol', { protocol })
      .andWhere('LOWER(wallet.address) = LOWER(:address)', { address })
      .getOne();
  }
}

export default WalletRepository;
