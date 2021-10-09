import { customAlphabet } from 'nanoid';

const alphanumeric =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const lowerAlphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';

export const generateUserId = () => customAlphabet(alphanumeric, 8);
export const generateWalletId = () => customAlphabet(alphanumeric, 12);
export const generateTokenId = () => customAlphabet(alphanumeric, 10);
export const generateCommunityId = () => customAlphabet(alphanumeric, 12);
export const generateTokenOwnershipId = () => customAlphabet(alphanumeric, 12);

export const generateInviteCode = (len = 6) =>
  customAlphabet(lowerAlphanumeric, len);
