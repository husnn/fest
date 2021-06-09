import { Currency, OfferStatus } from '@fanbase/shared';

import TokenOwnership from './TokenOwnership';
import User from './User';

export class TokenOffer {
  readonly id: string;

  status: OfferStatus = OfferStatus.SENT;

  senderId: string;
  sender: User;

  ownershipId: string;
  ownership: TokenOwnership;

  currency: Currency;
  amount: number = 0;

  constructor(data?: Partial<TokenOffer>) {
    Object.assign(this, data);
  }
}

export default TokenOffer;
