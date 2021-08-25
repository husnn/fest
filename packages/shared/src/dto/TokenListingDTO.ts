import { TokenListingStatus } from '../enums';
import TokenDTO from './TokenDTO';
import UserDTO from './UserDTO';

export class TokenListingDTO {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: UserDTO;

  tokenId: string;
  token: TokenDTO;

  quantity: number;
  available: number;

  currency: string;
  price: string;

  chain: {
    id: string;
    contract: string;
  };

  status: TokenListingStatus;

  constructor(data?: Partial<TokenListingDTO>) {
    this.id = data.id;
    this.dateCreated = data.dateCreated;

    if (data.seller) {
      this.seller = new UserDTO(data.seller);
    } else {
      this.sellerId = data.sellerId;
    }

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
