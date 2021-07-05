import { WalletDTO } from '@fanbase/shared';

import { Wallet } from '../entities';

export const mapWalletToDTO = (wallet: Wallet): WalletDTO =>
  new WalletDTO({ ...wallet });
