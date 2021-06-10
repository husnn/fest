import { Token, User } from '@fanbase/shared';

export const getTokenUrl = (token?: Token, id?: string) =>
  `/tokens/${token ? token.id : id}`;

export const getProfileUrl = ({
  username,
  id
}: {
  username?: string;
  id?: string;
}) => `/u/${username || id}`;

export const specific =
  <T>() =>
  <U extends T>(argument: U) =>
    argument;

export const truncateAddress = (
  address: string,
  start = 8,
  end = 4
): string => {
  if (address.length <= start + end) return address;

  return (
    address.substr(0, start) + '...' + address.substr(address.length - end)
  );
};

export const getDisplayName = (user: User) =>
  user.name || user.username || truncateAddress(user.wallet.address);
