import Token from './Token';
import User from './User';
import Wallet from './Wallet';

export class TokenOwnership {
  readonly id: string;

  dateCreated: Date;
  dateUpdated: Date;

  walletId: string;
  wallet?: Wallet;

  tokenId: string;
  token?: Token;

  owner?: User;

  quantity: number;

  constructor(data?: Partial<TokenOwnership>) {
    Object.assign(this, data);
  }
}

export default TokenOwnership;
