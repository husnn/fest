import React, { useEffect } from 'react';

import { AuthContext } from './AuthProvider';

export const useAuthentication = (redirect = false) => {
  const context = React.useContext(AuthContext);

  useEffect(() => {
    context.setRedirect(redirect);
  });

  return context;
};

export default useAuthentication;
