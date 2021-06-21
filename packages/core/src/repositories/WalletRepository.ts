import { Protocol } from '@fanbase/shared';

import { Wallet } from '../entities';
import Repository from './Repository';

export interface WalletRepository extends Repository<Wallet> {
  findByUser(protocol: Protocol, user: string): Promise<Wallet>;
  findByAddress(protocol: Protocol, address: string): Promise<Wallet>;
}

export default WalletRepository;
