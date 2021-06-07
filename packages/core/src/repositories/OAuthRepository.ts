import { OAuth, OAuthProvider } from '@fanbase/shared';

import Repository from './Repository';

export interface OAuthRepository extends Repository<OAuth> {
  findByUser(provider: OAuthProvider, user: string): Promise<OAuth>;
  createOrUpdate(oAuth: OAuth): Promise<OAuth>;
}

export default OAuthRepository;
