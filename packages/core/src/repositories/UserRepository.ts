import Repository from './Repository';
import { User } from '../entities';

export interface UserRepository extends Repository<User> {
  get(id: string, select?: Array<keyof User>): Promise<User>;
  addToken(userId: string, tokenId: string): Promise<void>;
  findByEmail(email: string, select?: Array<keyof User>): Promise<User>;
  findByEmailOrWallet(identifier: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
}

export default UserRepository;
