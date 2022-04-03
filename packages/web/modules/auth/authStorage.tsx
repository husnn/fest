import { CurrentUserDTO } from '@fest/shared';

const AUTH_EXPIRY = 'AUTH_EXPIRY';
const CURRENT_USER = 'CURRENT_USER';

export const getAuthExpiry = (): Date => {
  const expiry = localStorage.getItem(AUTH_EXPIRY);
  if (!expiry) return new Date();

  return new Date(parseInt(expiry) * 1000);
};

export const saveAuthExpiry = (exp: number) => {
  localStorage.setItem(AUTH_EXPIRY, exp.toString());
};

export const getCurrentUser = (): CurrentUserDTO | null => {
  let user: CurrentUserDTO | null;
  const data = localStorage.getItem(CURRENT_USER);

  if (data) {
    try {
      user = JSON.parse(data) as CurrentUserDTO;
    } catch (err) {
      console.log(err);
    }
  }

  return user;
};

export const saveCurrentUser = (user: CurrentUserDTO) => {
  if (user && typeof user === 'object' && Object.keys(user).length > 0)
    localStorage.setItem(CURRENT_USER, JSON.stringify(user));
};

export const removeAuth = () => {
  localStorage.removeItem(AUTH_EXPIRY);
  localStorage.removeItem(CURRENT_USER);
};
