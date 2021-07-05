import { User } from '../entities';
import Repository from './Repository';

export interface UserRepository extends Repository<User> {
  get(
    id: string,
    relations?: string[],
    select?: 'user.loginCode'
  ): Promise<User>;
  addToken(userId: string, tokenId: string): Promise<void>;
  findByEmail(email: string, select?: 'user.loginCode'): Promise<User>;
  findByUsername(username: string): Promise<User>;
}

export default UserRepository;
