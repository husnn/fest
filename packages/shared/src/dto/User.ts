import Wallet from './Wallet';

export interface IUser {
  id: string;
  name?: string;
  username?: string;
  wallet: Omit<Wallet, 'type'>;
}

export class User implements IUser {
  id: string;
  name?: string;
  username?: string;
  wallet: Omit<Wallet, 'type'>;

  constructor(props: IUser) {
    this.id = props.id;
    this.name = props.name;
    this.username = props.username;
    this.wallet = props.wallet;
  }
}
