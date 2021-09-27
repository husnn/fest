import Community from '../entities/Community';
import Repository from './Repository';

export interface CommunityRepository extends Repository<Community> {
  findByToken(id: string): Promise<Community[]>;
}

export default CommunityRepository;
