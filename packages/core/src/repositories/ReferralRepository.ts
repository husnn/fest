import Referral from '../entities/Referral';
import Repository from './Repository';

export interface ReferralRepository extends Repository<Referral> {}

export default ReferralRepository;
