import React, { useEffect, useState } from 'react';

import { CurrentUser } from '@fanbase/shared';

import { getAuthToken, getCurrentUser, removeAuth } from './authStorage';

export const AuthContext = React.createContext(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  useEffect(() => {
    const user = getCurrentUser();

    console.log('Getting current user...');

    setAuthenticated(getAuthToken() != null);
    setCurrentUser(user);
  }, []);

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
