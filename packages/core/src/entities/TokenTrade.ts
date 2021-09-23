import TokenListing from './TokenListing';
import User from './User';

export class TokenTrade {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: User;

  buyerId: string;
  buyer: User;

  tokenListingId: string;
  tokenListing: TokenListing;

  quantity: number;

  constructor(data?: Partial<TokenTrade>) {
    Object.assign(this, data);
  }
}

export default TokenTrade;
