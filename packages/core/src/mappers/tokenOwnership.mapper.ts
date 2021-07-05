import { TokenOwnershipDTO as TokenOwnershipDTO } from '@fanbase/shared';

import { TokenOwnership } from '../entities';
import { mapUserToDTO } from './user.mapper';
import { mapWalletToDTO } from './wallet.mapper';

export const mapTokenOwnershipToDTO = (
  ownership: TokenOwnership
): TokenOwnershipDTO =>
  new TokenOwnershipDTO({
    ...ownership,
    wallet: mapWalletToDTO(ownership.wallet)
    // owner: mapUserToDTO(ownership.owner)
  });
