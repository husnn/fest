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

  get(
    id: string,
    relations?: string[],
    select?: 'user.loginCode'
  ): Promise<User> {
    return this.db
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('user.id = :id', { id })
      .addSelect(select)
      .getOne();
  }

  findByEmail(email: string, select?: 'user.loginCode'): Promise<User> {
    return this.db
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .addSelect(select)
      .getOne();
  }

  findByUsername(username: string): Promise<User> {
    return this.db
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .leftJoinAndSelect('user.wallet', 'wallet')
      .getOne();
  }
}

export default UserRepository;
