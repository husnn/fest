import { Token } from '../entities';
import Repository from './Repository';

export interface TokenRepository extends Repository<Token> {
  findByCreator(user: string): Promise<Token[]>;
}

export default TokenRepository;
