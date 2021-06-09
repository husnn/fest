import { User, UserRepository as IUserRepository } from '@fanbase/core';

import UserSchema from '../schemas/UserSchema';
import Repository from './Repository';

export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor() {
    super(UserSchema);
  }

  async addToken(user: string, token: string): Promise<void> {
    await this.db
      .createQueryBuilder('user')
      .relation(UserSchema, 'tokensCreated')
      .of(user)
      .add(token);
  }

  async findByEmail(email: string): Promise<User> {
    return this.db.findOne({ email });
  }

  async findByUsername(username: string): Promise<User> {
    return this.db.findOne({ username });
  }
}

export default UserRepository;
