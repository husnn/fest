import { TokenOwnedDTO } from '@fanbase/shared';

import { TokenOwnership } from '../entities';
import { mapTokenToDTO } from './token.mapper';
import { mapTokenOwnershipToDTO } from './tokenOwnership.mapper';

export const mapOwnershipToTokenOwnedDTO = (
  ownership: TokenOwnership
): TokenOwnedDTO =>
  new TokenOwnedDTO({
    ...mapTokenToDTO(ownership.token),
    ownership: mapTokenOwnershipToDTO(ownership)
  });
