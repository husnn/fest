import TokenDTO from './TokenDTO';
import UserDTO from './UserDTO';

export class TokenOfferDTO {
  readonly id: string;

  buyer: UserDTO;
  seller: UserDTO;

  token: TokenDTO;

  quantity: number;

  currency: string;
  price: string;

  constructor(data?: Partial<TokenOfferDTO>) {
    Object.assign(this, data);
  }
}

export default TokenOfferDTO;
