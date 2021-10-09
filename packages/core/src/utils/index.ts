import { nanoid } from 'nanoid';

export const generateUserId = () => nanoid(8);
export const generateWalletId = () => nanoid(16);
export const generateTokenId = () => nanoid(8);
export const generateTokenOwnershipId = () => nanoid(16);
export const generateCommunityId = () => nanoid(10);
