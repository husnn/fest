import { UserDTO } from './UserDTO';
import WalletDTO from './WalletDTO';

export class TokenOwnershipDTO {
  id: string;
  tokenId: string;
  walletId: string;
  wallet?: WalletDTO;
  owner?: UserDTO;
  quantity: number;

  constructor(props: TokenOwnershipDTO) {
    this.id = props.id;

    this.tokenId = props.tokenId;
    this.walletId = props.walletId;

    if (props.wallet) {
      this.wallet = new WalletDTO(props.wallet);
    }

    if (props.owner) {
      this.owner = new UserDTO(props.owner);
    }

    this.quantity = props.quantity;
  }
}

export default TokenOwnershipDTO;
