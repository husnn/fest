import { Protocol, TokenListingStatus } from '@fanbase/shared';

import Token from './Token';
import User from './User';

export class TokenListing {
  readonly id: string;

  dateCreated: Date;

  protocol: Protocol;

  sellerId: string;
  seller: User;

  tokenId: string;
  token: Token;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  chain: {
    contract: string;
    id: string;
    tx: string;
  };

  status: TokenListingStatus;

  constructor(data?: Partial<TokenListing>) {
    Object.assign(this, data);
  }
}

export default TokenListing;
