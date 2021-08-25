import { TokenDTO } from '@fanbase/shared';

import { Token } from '../entities';

export const mapTokenToDTO = (token: Token): TokenDTO =>
  new TokenDTO({
    ...token
    // creator: mapUserToDTO(token.creator)
  });
