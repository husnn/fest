import Community from '../entities/Community';
import Repository from './Repository';

export interface CommunityRepository extends Repository<Community> {
  findByToken(id: string): Promise<Community[]>;
  getForUser(id: string, user: string): Promise<[Community, boolean]>;
  getAllForUser(
    user: string,
    count: number,
    page: number
  ): Promise<{ communities: Community[]; total: number }>;
  addUserForToken(userId: string, tokenId: string): Promise<void>;
  removeUserForToken(userId: string, tokenId: string): Promise<void>;
}

export default CommunityRepository;
