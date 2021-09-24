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

  get(id: string, select?: Array<keyof User>): Promise<User> {
    const query = this.db
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('user.id = :id', { id });

    if (select) {
      query.addSelect(select.map((property) => `user.${property}`));
    }

    return query.getOne();
  }

  findByEmail(email: string, select?: Array<keyof User>): Promise<User> {
    const query = this.db
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('LOWER(user.email) = LOWER(:email)', { email });

    if (select) {
      query.addSelect(select.map((property) => `user.${property}`));
    }

    return query.getOne();
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
