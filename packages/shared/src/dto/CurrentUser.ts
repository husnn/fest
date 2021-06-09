import Wallet from './Wallet';

export interface ICurrentUser {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  wallet: Wallet;
}

export class CurrentUser implements ICurrentUser {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  wallet: Wallet;

  constructor(props: ICurrentUser) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.username = props.username;
    this.wallet = props.wallet;
  }
}
