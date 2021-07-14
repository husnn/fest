import TokenListing from './TokenListing';
import User from './User';

export class TokenOrder {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: User;

  buyerId: string;
  buyer: User;

  tokenListingId: string;
  tokenListing: TokenListing;

  quantity: number;
  price: number;

  constructor(data?: Partial<TokenOrder>) {
    Object.assign(this, data);
  }
}

export default TokenOrder;
