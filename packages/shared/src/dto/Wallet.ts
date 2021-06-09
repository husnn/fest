import { Protocol, WalletType } from '../enums';

export interface IWallet {
  protocol: Protocol;
  type: WalletType;
  address: string;
}

export class Wallet implements IWallet {
  protocol: Protocol;
  type: WalletType;
  address: string;

  constructor(props: IWallet) {
    this.protocol = props.protocol;
    this.type = props.type;
    this.address = props.address;
  }
}

export default Wallet;
