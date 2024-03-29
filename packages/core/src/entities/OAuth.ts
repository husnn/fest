import { OAuthProvider } from '@fest/shared';
import User from './User';

export class OAuth {
  readonly id: string;

  userId: string;
  user: User;
  provider: OAuthProvider;
  externalId: string;
  accessToken: string;
  refreshToken: string;
  expiry: Date;

  constructor(data?: Partial<OAuth>) {
    Object.assign(this, data);
  }
}
