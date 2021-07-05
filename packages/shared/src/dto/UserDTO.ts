import WalletDTO from './WalletDTO';

export interface IUserDTO {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  wallet: Omit<WalletDTO, 'type'>;
}

export class UserDTO implements IUserDTO {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  wallet: Omit<WalletDTO, 'type'>;

  constructor(props: IUserDTO) {
    this.id = props.id;
    this.name = props.name;
    this.username = props.username;
    this.bio = props.bio;
    this.wallet = props.wallet;
  }
}
