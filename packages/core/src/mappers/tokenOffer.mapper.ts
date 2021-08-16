import { TokenOfferDTO } from '@fanbase/shared';

import { TokenOffer } from '../entities';

export const mapTokenOfferToDTO = (offer: TokenOffer): TokenOfferDTO =>
  new TokenOfferDTO({ ...offer });
