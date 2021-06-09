import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { CurrentUser } from '@fanbase/shared';

import { getAuthToken, getCurrentUser, removeAuth, saveCurrentUser } from './authStorage';

export const AuthContext = React.createContext(null);

export const AuthProvider: React.FC = ({ children }) => {
  const router = useRouter();

  const [isAuthenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  useEffect(() => {
    const user = getCurrentUser();
    const isAuthenticated = getAuthToken() != null;

    setAuthenticated(isAuthenticated);
    setCurrentUser(user);

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (currentUser && Object.keys(currentUser).length !== 0)
      saveCurrentUser(currentUser);
  }, [currentUser]);

  const clearAuth = () => {
    removeAuth();

    setAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        currentUser,
        setCurrentUser,
        clearAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
