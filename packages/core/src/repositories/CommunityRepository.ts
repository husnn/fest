import Community from '../entities/Community';
import Repository from './Repository';

export interface CommunityRepository extends Repository<Community> {
  findByToken(id: string): Promise<Community[]>;
  getForUser(id: string, user: string): Promise<[Community, boolean]>;
  findForUser(
    user: string,
    count: number,
    page: number
  ): Promise<{ communities: Community[]; total: number }>;
}

export default CommunityRepository;
