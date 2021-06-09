import { User } from '@fanbase/core';
import { CurrentUser, Wallet } from '@fanbase/shared';

export const mapUserToDTO = (user: User): CurrentUser => {
  return new CurrentUser({
    ...user,
    wallet: new Wallet(user.wallet)
  });
};
