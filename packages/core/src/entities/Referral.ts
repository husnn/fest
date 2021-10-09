import Invite from './Invite';
import User from './User';

export class Referral {
  readonly id: string;

  dateCreated: Date;

  inviteId: string;
  invite?: Invite;

  referrerId: string;
  referrer?: User;

  refereeId: string;
  referee?: User;

  constructor(data?: Partial<Referral>) {
    Object.assign(this, data);
  }
}

export default Referral;
