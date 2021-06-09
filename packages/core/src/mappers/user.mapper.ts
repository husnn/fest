import { User } from '@fanbase/core';
import { CurrentUser, User as UserDTO, Wallet } from '@fanbase/shared';

export const mapUserToCurrentDTO = (user: User): CurrentUser => {
  return new CurrentUser({
    ...user,
    wallet: new Wallet(user.wallet)
  });
};

export const mapUserToDTO = (user: User): UserDTO => {
  return new UserDTO({
    ...user,
    wallet: new Wallet({
      protocol: user.wallet.protocol,
      address: user.wallet.address
    })
  });
};
