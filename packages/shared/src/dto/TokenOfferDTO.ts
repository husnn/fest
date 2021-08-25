import TokenDTO from './TokenDTO';
import UserDTO from './UserDTO';

export class TokenOfferDTO {
  readonly id: string;

  buyer: UserDTO;
  seller: UserDTO;

  token: TokenDTO;

  currency: string;
  price: string;

  quantity: number;

  constructor(props?: Partial<TokenOfferDTO>) {
    this.id = props.id;

    this.buyer = new UserDTO(props.buyer);
    this.seller = new UserDTO(props.seller);

    this.token = new TokenDTO(props.token);

    this.currency = props.currency;
    this.price = props.price;

    this.quantity = props.quantity;
  }
}

export default TokenOfferDTO;
