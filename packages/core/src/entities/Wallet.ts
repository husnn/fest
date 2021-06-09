import { decryptText, encryptText, Protocol, WalletType } from '@fanbase/shared';

import User from './User';

export class Wallet {
  readonly id: string;
  type: WalletType = WalletType.EXTERNAL;
  protocol: Protocol;
  ownerId: string;
  owner: User;
  address: string;
  publicKey: string;
  seed: string;

  private _privateKey: string;

  constructor(data: Partial<Wallet>) {
    Object.assign(this, data);
    if (data.privateKey) this.type = WalletType.INTERNAL;
  }

  get privateKey() {
    return this._privateKey;
  }

  set privateKey(value: string) {
    if (value) this._privateKey = encryptText(value);
  }

  get decryptedPrivateKey() {
    return decryptText(this._privateKey);
  }
}

export default Wallet;
