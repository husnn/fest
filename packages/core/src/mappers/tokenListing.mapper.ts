import { TokenListingDTO } from '@fanbase/shared';

import { TokenListing } from '../entities';

export const mapTokenListingToDTO = (listing: TokenListing): TokenListingDTO =>
  new TokenListingDTO({
    ...listing
  });
