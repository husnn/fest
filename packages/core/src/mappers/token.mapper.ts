import { Token as TokenDTO } from '@fanbase/shared';

import { Token } from '../entities';

export const mapTokenToDTO = (token: Token): TokenDTO =>
  new TokenDTO({
    ...token,
    creator: token.creatorId
  });
