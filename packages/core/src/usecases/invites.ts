import { Invite, InviteRepository, generateInviteCode } from '..';

export const generateInvites = (
  inviteRepository: InviteRepository,
  user: string,
  isCreator = false,
  count = 1,
  maxUseCount = 1,
  expiryDate?: Date
) => {
  let i = 0;

  while (i < count) {
    const invite = new Invite({
      expiryDate,
      ownerId: user,
      code: generateInviteCode()(),
      maxUseCount,
      isCreator
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
  generateInvites(inviteRepository, user, isCreator, 3);
  if (isCreator) generateInvites(inviteRepository, user, false, 1, 1000);
};
