import Token from './Token';
import User from './User';

export class TokenOwnership {
  readonly id: string;

  ownerId: string;
  owner: User;

  tokenId: string;
  token: Token;

  quantity: number;
}

export default TokenOwnership;
