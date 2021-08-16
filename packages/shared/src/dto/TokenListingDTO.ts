import { TokenListingStatus } from '../enums';
import TokenDTO from './TokenDTO';
import UserDTO from './UserDTO';

export class TokenListingDTO {
  readonly id: string;

  dateCreated: Date;

  seller: UserDTO;

  tokenId: string;
  token: TokenDTO;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  chain: any;

  status: TokenListingStatus;

  constructor(data?: Partial<TokenListingDTO>) {
    this.id = data.id;
    this.dateCreated = data.dateCreated;

    if (data.token) {
      this.token = new TokenDTO(data.token);
    } else {
      this.tokenId = data.tokenId;
    }

    this.quantity = data.quantity;
    this.available = data.available;
    this.currency = data.currency;
    this.price = data.price;

    this.chain = data.chain;

    this.status = data.status;
  }
}

export default TokenListingDTO;
