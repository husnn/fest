import WalletDTO from './WalletDTO';

export class CurrentUserDTO {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  bio?: string;
  wallet: WalletDTO;
  isCreator: boolean;
  lastLogin?: Date;
  isFirstLogin?: boolean;

  constructor(props: CurrentUserDTO) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.username = props.username;
    this.bio = props.bio;
    this.wallet = new WalletDTO(props.wallet);
    this.isCreator = props.isCreator;
    this.lastLogin = props.lastLogin;
    this.isFirstLogin = !this.lastLogin;
  }
}
