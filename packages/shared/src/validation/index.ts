export * from './CreateTokenSchema';
export * from './UserInfoSchema';

export const UUID_REGEX =
  /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const USERNAME_REGEX =
  /^(?=.{3,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;

export const isUUID = (value: string) => UUID_REGEX.test(value);

export const isEmailAddress = (value: string) =>
  EMAIL_REGEX.test(String(value).toLowerCase());

export const isUsername = (value: string) => USERNAME_REGEX.test(value);
