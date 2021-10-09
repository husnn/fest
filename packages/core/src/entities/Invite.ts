import { InviteStatus } from '@fanbase/shared';
import User from './User';

export class Invite {
  readonly id: string;

  dateCreated: Date;

  status: InviteStatus;
  expiryDate: Date;

  ownerId: string;
  owner: User;

  code: string;

  useCount: number;
  maxUseCount: number;

  isCreator: boolean;

  constructor(data?: Partial<Invite>) {
    Object.assign(this, data);
  }

  static validate(invite: Invite) {
    return (
      invite.status === InviteStatus.ACTIVE &&
      invite.expiryDate > new Date() &&
      invite.useCount <= invite.maxUseCount
    );
  }

  static use(invite: Invite) {
    invite.useCount++;

    if (invite.useCount >= invite.maxUseCount) {
      invite.status = InviteStatus.USED;
    }

    if (invite.expiryDate <= new Date()) {
      invite.status = InviteStatus.EXPIRED;
    }

    return invite;
  }
}

export default Invite;
