import { WalletRepository as IWalletRepository } from '@fanbase/core';
import { Wallet } from '@fanbase/shared';

import WalletSchema from '../schemas/WalletSchema';
import Repository from './Repository';

export class WalletRepository
  extends Repository<Wallet>
  implements IWalletRepository {
  constructor () {
    super(WalletSchema);
  }

  async findByUser (protocol: string, user: string): Promise<Wallet> {
    return await this.db
      .createQueryBuilder('wallet')
      .where('wallet.protocol = :protocol', { protocol })
      .andWhere('wallet.ownerId = :user', { user })
      .getOne();
  }

  async findByAddress (protocol: string, address: string): Promise<Wallet> {
    return await this.db
      .createQueryBuilder('wallet')
      .where('wallet.protocol = :protocol', { protocol })
      .andWhere('wallet.address = :address', { address })
      .getOne();
  }
}

export default WalletRepository;
