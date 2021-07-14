import TokenDTO from './TokenDTO';
import UserDTO from './UserDTO';

export class TokenListingDTO {
  readonly id: string;

  seller: UserDTO;
  token: TokenDTO;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  constructor(data?: Partial<TokenListingDTO>) {
    Object.assign(this, data);
  }
}

export default TokenListingDTO;
