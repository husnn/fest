import WalletDTO from './WalletDTO';

export class UserDTO {
  id: string;

  name?: string;
  username?: string;
  bio?: string;

  wallet: WalletDTO;

  constructor(props: UserDTO) {
    this.id = props.id;

    this.name = props.name;
    this.username = props.username;
    this.bio = props.bio;

    if (props.wallet) {
      this.wallet = new WalletDTO(props.wallet);
    }
  }
}

export default UserDTO;
