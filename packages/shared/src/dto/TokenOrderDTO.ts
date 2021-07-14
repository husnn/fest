import TokenListingDTO from './TokenListingDTO';
import { UserDTO } from './UserDTO';

export class TokenOrderDTO {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: UserDTO;

  buyerId: string;
  buyer: UserDTO;

  tokenListingId: string;
  tokenListing: TokenListingDTO;

  quantity: number;

  price: number;

  constructor(data?: Partial<TokenOrderDTO>) {
    Object.assign(this, data);
  }
}

export default TokenOrderDTO;
