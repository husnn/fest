import { OAuthProvider } from '@fest/shared';

import { OAuth } from '../entities';
import Repository from './Repository';

export interface OAuthRepository extends Repository<OAuth> {
  findByUser(provider: OAuthProvider, user: string): Promise<OAuth>;
  createOrUpdate(oAuth: OAuth): Promise<OAuth>;
}

export default OAuthRepository;
