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

  constructor(props?: Partial<TokenTradeDTO>) {
    this.id = props.id;

    this.dateCreated = props.dateCreated;

    this.sellerId = props.sellerId;
    if (props.seller) {
      this.seller = new UserDTO(props.seller);
    }

    this.buyerId = props.buyerId;
    if (props.buyer) {
      this.buyer = new UserDTO(props.buyer);
    }

    this.tokenListingId = props.tokenListingId;
    if (props.tokenListing) {
      this.tokenListing = new TokenListingDTO(props.tokenListing);
    }

    this.quantity = props.quantity;

    this.price = props.price;
  }
}

export default TokenTradeDTO;
