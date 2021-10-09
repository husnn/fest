import {
  ReferralRepository as IReferralRepository,
  Referral
} from '@fanbase/core';

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
