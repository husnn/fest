import OAuthProvider from '../enums/OAuthProvider';
import User from './User';

export class OAuth {
  readonly id: string;

  userId: string;
  user: User;
  provider: OAuthProvider;
  accessToken: string;
  refreshToken: string;
  expiry: Date;

  constructor (data?: Partial<OAuth>) {
    Object.assign(this, data);
  }
}
