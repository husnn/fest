import { InviteStatus, InviteType } from '@fest/shared';

import User from './User';

export class Invite {
  readonly id: string;

  dateCreated: Date;

  status: InviteStatus;
  expiryDate: Date;

  type: InviteType;

  ownerId: string;
  owner: User;

  code: string;

  useCount: number;
  maxUseCount: number;

  constructor(data?: Partial<Invite>) {
    Object.assign(this, data);
  }

  static validate(invite: Invite) {
    return (
      invite.status === InviteStatus.ACTIVE &&
      (!invite.expiryDate || invite.expiryDate > new Date()) &&
      invite.useCount <= invite.maxUseCount
    );
  }

  static use(invite: Invite) {
    invite.useCount++;

    if (invite.useCount >= invite.maxUseCount) {
      invite.status = InviteStatus.USED;
    }

    if (invite.expiryDate && invite.expiryDate <= new Date()) {
      invite.status = InviteStatus.EXPIRED;
    }

    return invite;
  }
}

export default Invite;
