import { Protocol, WalletType } from '../enums';

export interface IWalletDTO {
  id: string;
  type?: WalletType;
  protocol: Protocol;
  address: string;
}

export class WalletDTO implements IWalletDTO {
  id: string;

  type?: WalletType;
  protocol: Protocol;

  address: string;

  constructor(props: IWalletDTO) {
    this.id = props.id;

    this.type = props.type;
    this.protocol = props.protocol;

    this.address = props.address;
  }
}

export default WalletDTO;
