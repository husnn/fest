import { OAuth, OAuthRepository as IOAuthRepository } from '@fanbase/core';
import { OAuthProvider } from '@fanbase/shared';

import OAuthSchema from '../schemas/OAuthSchema';
import Repository from './Repository';

export class OAuthRepository
  extends Repository<OAuth>
  implements IOAuthRepository
{
  constructor() {
    super(OAuthSchema);
  }

  async findByUser(provider: OAuthProvider, user: string): Promise<OAuth> {
    return await this.db.findOne({ provider, userId: user });
  }

  async createOrUpdate(oAuth: OAuth): Promise<OAuth> {
    return await this.db.save(oAuth);
  }
}
