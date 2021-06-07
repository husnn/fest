import React from 'react';

import { AuthContext } from './AuthProvider';

export const useAuthentication = () => React.useContext(AuthContext);

export default useAuthentication;
