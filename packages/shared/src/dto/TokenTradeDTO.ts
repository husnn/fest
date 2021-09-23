import TokenListingDTO from './TokenListingDTO';
import { UserDTO } from './UserDTO';

export class TokenTradeDTO {
  readonly id: string;

  dateCreated: Date;

  sellerId: string;
  seller: UserDTO;

  buyerId: string;
  buyer: UserDTO;

  isSeller?: boolean; // Current user

  tokenListingId: string;
  tokenListing: TokenListingDTO;

  quantity: number;

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

    this.isSeller = props.isSeller;

    this.tokenListingId = props.tokenListingId;
    if (props.tokenListing) {
      this.tokenListing = new TokenListingDTO(props.tokenListing);
    }

    this.quantity = props.quantity;
  }
}

export default TokenTradeDTO;
