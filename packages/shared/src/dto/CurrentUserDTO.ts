import WalletDTO from './WalletDTO';

export class CurrentUserDTO {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  bio?: string;
  wallet: WalletDTO;

  constructor(props: CurrentUserDTO) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.username = props.username;
    this.bio = props.bio;
    this.wallet = props.wallet;
  }
}
