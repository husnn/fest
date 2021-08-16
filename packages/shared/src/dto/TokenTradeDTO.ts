import TokenListingDTO from './TokenListingDTO';
import { UserDTO } from './UserDTO';

export class TokenTradeDTO {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: UserDTO;

  buyerId: string;
  buyer: UserDTO;

  tokenListingId: string;
  tokenListing: TokenListingDTO;

  quantity: number;

  price: string;

  constructor(data?: Partial<TokenTradeDTO>) {
    Object.assign(this, data);
  }
}

export default TokenTradeDTO;
