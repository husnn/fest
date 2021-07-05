import { CurrentUserDTO } from '@fanbase/shared';

const AUTH_TOKEN = 'AUTH_TOKEN';
const CURRENT_USER = 'CURRENT_USER';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN);

export const saveAuthToken = (token: string) => {
  if (token && typeof token === 'string' && token.length > 0)
    localStorage.setItem(AUTH_TOKEN, token);
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
  localStorage.removeItem(AUTH_TOKEN);
  localStorage.removeItem(CURRENT_USER);
};
