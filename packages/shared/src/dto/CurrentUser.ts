import Wallet from './Wallet';

export interface ICurrentUser {
  name?: string;
  email?: string;
  username?: string;
  wallet: Wallet;
}

export class CurrentUser implements ICurrentUser {
  name?: string;
  email?: string;
  username?: string;
  wallet: Wallet;

  constructor(props: ICurrentUser) {
    this.name = props.name;
    this.email = props.email;
    this.username = props.username;
    this.wallet = props.wallet;
  }
}
