import { User } from '../entities';
import Repository from './Repository';

export interface UserRepository extends Repository<User> {
  addToken(userId: string, tokenId: string): Promise<void>;
  findByEmail(email: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
}

export default UserRepository;
