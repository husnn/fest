import { Currency, OfferStatus } from '@fanbase/shared';

import TokenOwnership from './TokenOwnership';
import User from './User';

export class TokenOffer {
  readonly id: string;

  dateSent: Date;

  status: OfferStatus = OfferStatus.SENT;

  senderId: string;
  sender: User;

  receiverId: string;
  receiver: User;

  ownershipId: string;
  ownership: TokenOwnership;

  quantity = 1;

  currency: Currency;
  price: string;

  expiry: Date;

  signature: string;

  constructor(data?: Partial<TokenOffer>) {
    Object.assign(this, data);
  }
}

export default TokenOffer;
