import jwt from 'jsonwebtoken';

type TokenData = {
  communityId: string;
};

const verify = <T extends Record<string, string | number>>(
  token: string,
  secret: string
): T => {
  return jwt.verify(token, secret) as T;
};

const sign = <T extends Record<string, string | number>>(
  payload: T,
  secret: string,
  expiry: string
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

export const generateCommunityToken = (communityId: string) => {
  return sign<TokenData>(
    { communityId },
    process.env.HOUSE_JWT_SECRET,
    process.env.HOUSE_JWT_EXPIRY
  );
};

export const verifyCommunityToken = (token: string) => {
  return verify<TokenData>(token, process.env.HOUSE_JWT_SECRET);
};
