import { TokenDTO } from '@fanbase/shared';

import { Token } from '../entities';
import { mapUserToDTO } from './user.mapper';

export const mapTokenToDTO = (token: Token): TokenDTO =>
  new TokenDTO({
    ...token
    // creator: mapUserToDTO(token.creator)
  });
