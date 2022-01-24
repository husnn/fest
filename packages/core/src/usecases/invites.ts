import { Invite, InviteRepository, generateInviteCode } from '..';

import { InviteType } from '@fest/shared';

export const generateInvites = (
  inviteRepository: InviteRepository,
  user: string,
  type: InviteType,
  count = 1,
  maxUseCount = 1,
  expiryDate?: Date
) => {
  let i = 0;

  while (i < count) {
    const invite = new Invite({
      expiryDate,
      type,
      ownerId: user,
      code: generateInviteCode()(),
      maxUseCount
    });

    inviteRepository.create(invite);

    i++;
  }
};

export const generateInvitesForNewUser = (
  inviteRepository: InviteRepository,
  user: string,
  isCreator: boolean
) => {
  if (isCreator) {
    generateInvites(inviteRepository, user, InviteType.CREATOR, 3);
    generateInvites(inviteRepository, user, InviteType.FAN, 1, 1000);
    return;
  }
  generateInvites(inviteRepository, user, InviteType.BASIC, 3);
};
