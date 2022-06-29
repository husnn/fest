import { decryptText, encryptText, randomNumericString } from '@fest/shared';

export const encryptCommunityId = (id: string) => {
  const salt = randomNumericString(20);
  return encryptText(
    JSON.stringify({
      id,
      salt
    })
  );
};

export const decryptCommunityId = (encrypted: string) => {
  return JSON.parse(decryptText(encrypted)).id;
};
