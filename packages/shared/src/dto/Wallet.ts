import { Protocol, WalletType } from '../enums';

export interface IWallet {
  type?: WalletType;
  protocol: Protocol;
  address: string;
}

export class Wallet implements IWallet {
  type?: WalletType;
  protocol: Protocol;
  address: string;

  constructor(props: IWallet) {
    this.type = props.type;
    this.protocol = props.protocol;
    this.address = props.address;
  }
}

export default Wallet;
