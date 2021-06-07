import { Token, User } from '@fanbase/shared';

export const getTokenUrl = (token?: Token, id?: string) =>
  `/tokens/${token ? token.id : id}`;

export const specific = <T>() => <U extends T>(argument: U) => argument;

export const getDisplayName = (user: User) => user.email;
