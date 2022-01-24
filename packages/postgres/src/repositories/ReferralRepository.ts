import {
  ReferralRepository as IReferralRepository,
  Referral
} from '@fest/core';

import ReferralSchema from '../schemas/ReferralSchema';
import Repository from './Repository';

export class ReferralRepository
  extends Repository<Referral>
  implements IReferralRepository
{
  constructor() {
    super(ReferralSchema);
  }
}
